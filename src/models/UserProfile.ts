export interface UserProfile {
    username: string;
    displayName: string;
    bio: string;
    headerImageUrl: string;
    profileImageUrl: string;
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
}