export interface PostData {
    id: number;
    parentPostId?: number | null;
    repostParentId?: number | null;
    username: string;
    profilePicture: string;
    content: string;
    mediaUrl?: string | null;
    likesCount: number;
    repliesCount: number;
    repostsCount: number;
    viewCount: number;
    isLiked: boolean;
    isReposted: boolean;
    repostPostData?: PostData | null;
    deleted?: boolean;
    createdAt: string;
}
