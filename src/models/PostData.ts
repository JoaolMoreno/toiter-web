export interface PostData {
    id: number;
    parentPostId?: number | null;
    repostParentId?: number | null;
    isRepost: boolean;
    isReply: boolean;
    username: string;
    content: string;
    mediaUrl?: string | null;
    likesCount: number;
    repliesCount: number;
    repostsCount: number;
    viewCount: number;
    repostPostData?: PostData | null; // Para aninhamento em reposts
    deleted?: boolean; // Apenas para controle interno, se necessário
    createdAt: string; // Data no formato ISO-8601
}
