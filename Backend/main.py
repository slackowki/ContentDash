import os
import json
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv
from apify_client import ApifyClient

# Load environment variables
load_dotenv('.env.local')

class TikTokScraper:
    def __init__(self):
        self.api_key = os.getenv('APIFY_TIKTOK_KEY')
        if not self.api_key:
            raise ValueError("APIFY_TIKTOK_KEY not found in .env.local file")
        
        self.client = ApifyClient(self.api_key)
        self.actor_id = "clockworks/tiktok-scraper"
        
    def get_user_input(self):
        """Get user input for scraping parameters"""
        print("=== TikTok Content Scraper ===\n")
        
        # Step 1: Select type
        print("1. Select search type:")
        print("   1) Keyword search")
        print("   2) Hashtag search")
        
        while True:
            choice = input("\nEnter choice (1 or 2): ").strip()
            if choice in ['1', '2']:
                search_type = 'keyword' if choice == '1' else 'hashtag'
                break
            print("Invalid choice. Please enter 1 or 2.")
        
        # Step 2: Get search term
        if search_type == 'keyword':
            search_term = input("\nEnter keyword (single term): ").strip()
        else:
            search_term = input("\nEnter hashtag (without #): ").strip()
            # Remove # if user included it
            search_term = search_term.lstrip('#')
        
        # Step 3: Get days back to search
        print("\n3. Date range:")
        while True:
            days_input = input("How many days back do you want to search? (e.g., 7 for last 7 days): ").strip()
            if days_input.isdigit() and int(days_input) > 0:
                days_back = int(days_input)
                break
            print("Please enter a valid number of days (e.g., 7)")
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        
        print(f"Date range: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')} ({days_back} days)")
        
        # Step 4: Optional minimum hearts filter for popularity
        print("\n4. Optional popularity filter:")
        print("   Enter minimum number of hearts/likes (or press Enter to skip)")
        min_hearts_input = input("Minimum hearts: ").strip()
        min_hearts = None
        if min_hearts_input and min_hearts_input.isdigit():
            min_hearts = int(min_hearts_input)
            print(f"Will filter videos with at least {min_hearts} hearts")
        
        return search_type, search_term, start_date, end_date, min_hearts, days_back
    
    def create_actor_input(self, search_type, search_term, start_date, end_date, min_hearts=None, results_per_page=50):
        """Create input configuration for the Apify actor"""
        
        # Calculate date for the specified days ago in YYYY-MM-DD format
        days_ago = (datetime.now() - start_date).days
        oldest_date = start_date.strftime('%Y-%m-%d')
        
        if search_type == 'hashtag':
            # For hashtag search
            actor_input = {
                "hashtags": [search_term],
                "resultsPerPage": results_per_page,
                "oldestPostDateUnified": oldest_date,  # Only videos from specified date range
                "shouldDownloadCovers": False,
                "shouldDownloadSlideshowImages": False,
                "shouldDownloadSubtitles": False,
                "shouldDownloadVideos": False,
                "shouldDownloadAvatars": False,
                "shouldDownloadMusicCovers": False,
                "proxyCountryCode": "US",
                "excludePinnedPosts": False,
                "scrapeRelatedVideos": False
            }
            
            # Add minimum hearts filter if specified
            # Note: according to docs, this doesn't work with date filters
            # but we'll include it anyway for hashtag searches
            if min_hearts:
                actor_input["leastDiggs"] = min_hearts
            
        else:
            # For keyword search using search functionality
            actor_input = {
                "searchQueries": [search_term],
                "resultsPerPage": results_per_page,
                "searchSection": "",  # Default to "Top" results (most popular)
                "shouldDownloadCovers": False,
                "shouldDownloadSlideshowImages": False,
                "shouldDownloadSubtitles": False,
                "shouldDownloadVideos": False,
                "shouldDownloadAvatars": False,
                "shouldDownloadMusicCovers": False,
                "proxyCountryCode": "US",
                "excludePinnedPosts": False,
                "scrapeRelatedVideos": False
            }
            
            # For search queries, we can't combine date filters with heart filters
            # So we'll apply the date filter in post-processing
            if min_hearts:
                print(f"Note: Minimum hearts filter ({min_hearts}) will be applied after scraping")
        
        return actor_input
    
    def start_scraping(self, actor_input):
        """Start the scraping process"""
        try:
            # Run the actor (without verbose logging)
            run = self.client.actor(self.actor_id).call(run_input=actor_input)
            return run
            
        except Exception as e:
            print(f"Error during scraping: {str(e)}")
            return None
    
    def get_results(self, run):
        """Get the results from the completed run"""
        try:
            # Get the dataset items
            dataset_items = list(self.client.dataset(run['defaultDatasetId']).iterate_items())
            return dataset_items
            
        except Exception as e:
            print(f"Error getting results: {str(e)}")
            return None
    
    def scrape_until_target_found(self, search_type, search_term, start_date, end_date, min_hearts=None, target_count=10):
        """Scrape iteratively until we find the target number of videos that meet our criteria"""
        
        all_qualified_videos = []
        current_batch_size = 50
        max_total_scraped = 500  # Safety limit to prevent infinite scraping
        total_scraped = 0
        
        days_back = (datetime.now() - start_date).days
        
        print(f"Target: Find {target_count} videos that meet criteria")
        print(f"Criteria: Last {days_back} days" + (f" + minimum {min_hearts} hearts" if min_hearts else ""))
        
        while len(all_qualified_videos) < target_count and total_scraped < max_total_scraped:
            print(f"\n--- Batch {(total_scraped // current_batch_size) + 1} ---")
            print(f"Scraping {current_batch_size} videos...")
            
            # Create actor input for this batch
            actor_input = self.create_actor_input(
                search_type, search_term, start_date, end_date, 
                min_hearts, current_batch_size
            )
            
            # Start scraping
            run = self.start_scraping(actor_input)
            
            if not run:
                print("Scraping failed for this batch")
                break
            
            # Get results
            results = self.get_results(run)
            
            if not results:
                print("No results found for this batch")
                break
            
            total_scraped += len(results)
            print(f"Retrieved {len(results)} videos from this batch")
            
            # Filter this batch using the specified date range
            qualified_batch = self.filter_and_sort_results(results, min_hearts, start_date, end_date)
            
            if qualified_batch:
                all_qualified_videos.extend(qualified_batch)
                print(f"Found {len(qualified_batch)} qualifying videos in this batch")
                print(f"Total qualifying videos so far: {len(all_qualified_videos)}")
            else:
                print("No qualifying videos found in this batch")
            
            # If we have enough, break
            if len(all_qualified_videos) >= target_count:
                print(f"✅ Target reached! Found {len(all_qualified_videos)} qualifying videos")
                break
            
            # Increase batch size for next iteration to find more videos faster
            current_batch_size = min(100, current_batch_size + 25)
            
            # Small delay between batches to be respectful
            print("Waiting 2 seconds before next batch...")
            time.sleep(2)
        
        # Sort all qualified videos by engagement and return top target_count
        if all_qualified_videos:
            def calculate_engagement(item):
                likes = item.get('diggCount', 0) or 0
                comments = item.get('commentCount', 0) or 0
                shares = item.get('shareCount', 0) or 0
                views = item.get('playCount', 0) or 0
                engagement = likes + (comments * 2) + (shares * 3) + (views * 0.01)
                return engagement
            
            all_qualified_videos.sort(key=calculate_engagement, reverse=True)
            final_results = all_qualified_videos[:target_count]
            
            print(f"\n🎯 Final Results:")
            print(f"Total videos scraped: {total_scraped}")
            print(f"Qualifying videos found: {len(all_qualified_videos)}")
            print(f"Returning top {len(final_results)} videos")
            
            return final_results
        else:
            print(f"\n❌ No qualifying videos found after scraping {total_scraped} videos")
            return []
        """Start the scraping process"""
        print("Starting TikTok scraping...")
        print(f"Input parameters: {json.dumps(actor_input, indent=2)}")
        
        try:
            # Run the actor
            run = self.client.actor(self.actor_id).call(run_input=actor_input)
            
            print(f"Scraping completed successfully. Run ID: {run['id']}")
            return run
            
        except Exception as e:
            print(f"Error during scraping: {str(e)}")
            return None
    
    def get_results(self, run):
        """Get the results from the completed run"""
        try:
            # Get the dataset items
            dataset_items = list(self.client.dataset(run['defaultDatasetId']).iterate_items())
            return dataset_items
            
        except Exception as e:
            print(f"Error getting results: {str(e)}")
            return None
    
    def filter_and_sort_results(self, data, min_hearts=None, start_date=None, end_date=None):
        """Filter and sort results by popularity (engagement) and date"""
        if not data:
            return []
        
        # Use the provided date range or default to 7 days ago
        if start_date is None:
            start_date = datetime.now() - timedelta(days=7)
        if end_date is None:
            end_date = datetime.now()
        
        filtered_data = []
        for item in data:
            # Parse the creation date
            create_time = item.get('createTimeISO')
            if create_time:
                try:
                    video_date = datetime.fromisoformat(create_time.replace('Z', '+00:00'))
                    # Convert to local time for comparison
                    video_date = video_date.replace(tzinfo=None)
                    
                    # Check if video is within specified date range
                    if start_date <= video_date <= end_date:
                        # Apply minimum hearts filter if specified
                        if min_hearts:
                            hearts = item.get('diggCount', 0) or 0
                            if hearts >= min_hearts:
                                filtered_data.append(item)
                        else:
                            filtered_data.append(item)
                except:
                    # If date parsing fails, include the item (but still apply hearts filter)
                    if min_hearts:
                        hearts = item.get('diggCount', 0) or 0
                        if hearts >= min_hearts:
                            filtered_data.append(item)
                    else:
                        filtered_data.append(item)
            else:
                # If no date, include the item (but still apply hearts filter)
                if min_hearts:
                    hearts = item.get('diggCount', 0) or 0
                    if hearts >= min_hearts:
                        filtered_data.append(item)
                else:
                    filtered_data.append(item)
        
        # Sort by engagement score (likes + comments + shares + views)
        def calculate_engagement(item):
            likes = item.get('diggCount', 0) or 0
            comments = item.get('commentCount', 0) or 0
            shares = item.get('shareCount', 0) or 0
            views = item.get('playCount', 0) or 0
            
            # Weight formula: likes * 1 + comments * 2 + shares * 3 + views * 0.01
            engagement = likes + (comments * 2) + (shares * 3) + (views * 0.01)
            return engagement
        
        # Sort by engagement score (highest first)
        filtered_data.sort(key=calculate_engagement, reverse=True)
        
        # Return top 100
        return filtered_data[:100]
    
    def save_results(self, data, search_term, start_date, end_date):
        """Save results to JSON file"""
        if not data:
            print("No data to save")
            return
        
        # Create filename
        date_range = f"{start_date.strftime('%Y%m%d')}-{end_date.strftime('%Y%m%d')}"
        filename = f"{search_term.replace(' ', '_')}_{date_range}_top10.json"
        
        # Prepare data for saving
        save_data = {
            "search_term": search_term,
            "date_range": {
                "start": start_date.strftime('%Y-%m-%d'),
                "end": end_date.strftime('%Y-%m-%d')
            },
            "total_results": len(data),
            "scraped_at": datetime.now().isoformat(),
            "results": data
        }
        
        # Save to file
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(save_data, f, ensure_ascii=False, indent=2)
        
        print(f"Results saved to: {filename}")
        print(f"Total videos found: {len(data)}")
        
        # Print summary statistics
        if data:
            total_likes = sum(item.get('diggCount', 0) for item in data)
            total_views = sum(item.get('playCount', 0) for item in data)
            total_comments = sum(item.get('commentCount', 0) for item in data)
            
            print(f"\nSummary Statistics:")
            print(f"Total Likes: {total_likes:,}")
            print(f"Total Views: {total_views:,}")
            print(f"Total Comments: {total_comments:,}")
            if len(data) > 0:
                print(f"Average Likes per video: {total_likes / len(data):,.0f}")
                print(f"Average Views per video: {total_views / len(data):,.0f}")
            
            # Show top 3 videos
            print(f"\nTop 3 Videos:")
            for i, video in enumerate(data[:3]):
                print(f"{i+1}. {video.get('text', 'No caption')[:50]}...")
                print(f"   👍 {video.get('diggCount', 0):,} | 💬 {video.get('commentCount', 0):,} | 👁️ {video.get('playCount', 0):,}")
                print(f"   🔗 {video.get('webVideoUrl', 'N/A')}")
                print()
        """Save results to JSON file"""
        if not data:
            print("No data to save")
            return
        
        # Create filename
        date_range = f"{start_date.strftime('%Y%m%d')}-{end_date.strftime('%Y%m%d')}"
        filename = f"{search_term}_{date_range}_100.json"
        
        # Prepare data for saving
        save_data = {
            "search_term": search_term,
            "date_range": {
                "start": start_date.strftime('%Y-%m-%d'),
                "end": end_date.strftime('%Y-%m-%d')
            },
            "total_results": len(data),
            "scraped_at": datetime.now().isoformat(),
            "results": data
        }
        
        # Save to file
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(save_data, f, ensure_ascii=False, indent=2)
        
        print(f"Results saved to: {filename}")
        print(f"Total videos found: {len(data)}")
        
        # Print summary statistics
        if data:
            total_likes = sum(item.get('diggCount', 0) for item in data)
            total_views = sum(item.get('playCount', 0) for item in data)
            total_comments = sum(item.get('commentCount', 0) for item in data)
            
            print(f"\nSummary Statistics:")
            print(f"Total Likes: {total_likes:,}")
            print(f"Total Views: {total_views:,}")
            print(f"Total Comments: {total_comments:,}")
            print(f"Average Likes per video: {total_likes / len(data):,.0f}")
            print(f"Average Views per video: {total_views / len(data):,.0f}")
    
    def run(self):
        """Main execution method"""
        try:
            # Get user input
            search_type, search_term, start_date, end_date, min_hearts, days_back = self.get_user_input()
            
            # Scrape until we find 10 qualifying videos
            print(f"\n🚀 Starting smart scraping for '{search_term}'...")
            final_results = self.scrape_until_target_found(
                search_type, search_term, start_date, end_date, min_hearts, target_count=10
            )
            
            if final_results:
                # Save results
                self.save_results(final_results, search_term, start_date, end_date)
            else:
                print("No qualifying videos found. Try:")
                print("- Lowering the minimum hearts requirement")
                print("- Using a more popular search term")
                print("- Extending the date range (more days back)")
                
        except KeyboardInterrupt:
            print("\nScraping interrupted by user")
        except Exception as e:
            print(f"Error: {str(e)}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    scraper = TikTokScraper()
    scraper.run()