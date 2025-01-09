import React from 'react';
import styled from 'styled-components';

interface PostTextProps {
    content: string;
}

const PostText: React.FC<PostTextProps> = ({ content }) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const renderContent = () => {
        return content.split(urlRegex).map((part, index) => {
            if (urlRegex.test(part) && isValidUrl(part)) {
                return (
                    <StyledLink
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {part}
                    </StyledLink>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    return <TextWrapper>{renderContent()}</TextWrapper>;
};

export default PostText;

const TextWrapper = styled.p`
    color: ${({ theme }) => theme.colors.text};
    font-size: 16px;
    line-height: 1.6;
    margin: 8px 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
`;

const StyledLink = styled.a`
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;

    &:hover {
        text-decoration: none;
    }
`;
