export interface UserProfile {
    username: string;
    displayName: string;
    bio: string;
    headerImageUrl: string | null;
    profileImageUrl: string | null;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    isFollowing: boolean;
    isFollowingMe: boolean;
  }

export interface UpdatedUser {
    displayName: string;
    bio: string;
}
export interface User {
  username: string;
  displayName: string;
  bio: string;
  profileImageId: number | null;
  headerImageId: number | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}