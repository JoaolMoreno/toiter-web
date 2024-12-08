import { createContext, useContext, useState } from "react";
import {PostData} from "@/models/PostData";

// Definindo a interface dos valores no contexto
interface FeedContextType {
    posts: PostData[];
    setPosts: React.Dispatch<React.SetStateAction<PostData[]>>;
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    hasMore: boolean;
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

// Criando o contexto com o tipo correto
export const FeedContext = createContext<FeedContextType | undefined>(undefined);

export const FeedProvider = ({ children }: { children: React.ReactNode }) => {
    const [posts, setPosts] = useState<PostData[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    return (
        <FeedContext.Provider
            value={{ posts, setPosts, page, setPage, hasMore, setHasMore, loading, setLoading }}
        >
            {children}
        </FeedContext.Provider>
    );
};

export const useFeedContext = () => {
    const context = useContext(FeedContext);
    if (!context) {
        throw new Error("useFeedContext deve ser usado dentro de um FeedProvider");
    }
    return context;
};
