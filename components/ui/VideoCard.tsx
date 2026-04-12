
import React from 'react';

interface VideoCardProps {
  url: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ url }) => {
  const getEmbedUrl = (videoUrl: string) => {
    let videoId;
    if (videoUrl.includes('youtube.com/watch?v=')) {
      videoId = new URL(videoUrl).searchParams.get('v');
    } else if (videoUrl.includes('youtu.be/')) {
      videoId = new URL(videoUrl).pathname.slice(1);
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return <p className="text-red-500 mt-2">Invalid YouTube URL provided.</p>;
  }

  return (
    <div className="mt-4">
      <div className="aspect-w-16 aspect-h-9">
        <iframe
          src={embedUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-lg shadow-md"
        ></iframe>
      </div>
    </div>
  );
};

export default VideoCard;
