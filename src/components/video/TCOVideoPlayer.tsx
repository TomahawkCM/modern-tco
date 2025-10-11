'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { analytics } from '@/lib/analytics';

export interface TCOVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: number; // in seconds
  moduleId: string;
  domain: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  thumbnail?: string;
  transcriptUrl?: string;
}

interface TCOVideoPlayerProps {
  video: TCOVideo;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  autoPlay?: boolean;
  showTranscript?: boolean;
}

export const TCOVideoPlayer: React.FC<TCOVideoPlayerProps> = ({
  video,
  onProgress,
  onComplete,
  autoPlay = false,
  showTranscript = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const videoObj = video;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setWatchTime(prev => prev + 0.1); // Approximate watch time tracking
      
      if (onProgress) {
        const progress = (video.currentTime / video.duration) * 100;
        onProgress(progress);
      }
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsCompleted(true);
      setIsPlaying(false);
      analytics.capture('video_complete', {
        id: videoObj.id,
        title: videoObj.title,
        moduleId: videoObj.moduleId,
        domain: videoObj.domain,
        duration: Math.floor(videoObj.duration || 0),
      });
      if (onComplete) {
        onComplete();
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      analytics.capture('video_play', {
        id: videoObj.id,
        title: videoObj.title,
        moduleId: videoObj.moduleId,
        domain: videoObj.domain,
      });
    };
    const handlePause = () => {
      setIsPlaying(false);
      const dur = video.duration || 0;
      analytics.capture('video_pause', {
        id: videoObj.id,
        title: videoObj.title,
        moduleId: videoObj.moduleId,
        domain: videoObj.domain,
        position: Math.floor(video.currentTime),
        percent: dur ? Math.round((video.currentTime / dur) * 100) : 0,
      });
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onProgress, onComplete]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const seekTime = (value[0] / 100) * duration;
    video.currentTime = seekTime;
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0] / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Progress milestones 25/50/75/100
  const milestonesRef = useRef<{[k:string]: boolean}>({});
  useEffect(() => {
    if (!duration) return;
    const p = progressPercentage;
    const mark = (m: number) => {
      const key = String(m);
      if (!milestonesRef.current[key] && p >= m) {
        milestonesRef.current[key] = true;
        void analytics.capture('video_progress', { id: videoObj.id, title: videoObj.title, moduleId: videoObj.moduleId, domain: videoObj.domain, milestone: m });
      }
    };
    mark(25); mark(50); mark(75); mark(100);
  }, [progressPercentage, duration, videoObj.id, videoObj.title]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {video.title}
            {isCompleted && <CheckCircle className="w-5 h-5 text-[#22c55e]" />}
          </CardTitle>
          <Badge variant="secondary">{video.domain}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{video.description}</p>
        <div className="flex gap-2">
          {video.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Video Player */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full aspect-video"
            autoPlay={autoPlay}
            preload="metadata"
            onClick={togglePlay}
          >
            <source src={video.url} type="video/mp4" />
            <track
              kind="captions"
              srcLang="en"
              src={video.transcriptUrl}
              default={showTranscript}
            />
            Your browser does not support the video tag.
          </video>

          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="space-y-2">
              {/* Progress Bar */}
              <Progress value={progressPercentage} className="h-1" />
              
              {/* Controls */}
              <div className="flex items-center justify-between text-foreground">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="text-foreground hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-foreground hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <div className="w-24">
                      <Slider
                        value={[Math.round(volume * 100)]}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                        className="h-4"
                        aria-label="Volume"
                      />
                    </div>
                  </div>

                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-foreground hover:bg-white/20"
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Stats */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Duration: {formatTime(video.duration)}</span>
          <span>Watch Time: {formatTime(watchTime)}</span>
          <span>Progress: {Math.round(progressPercentage)}%</span>
        </div>

        {/* Transcript Toggle */}
        {video.transcriptUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const video = videoRef.current;
              if (video) {
                const track = video.textTracks[0];
                track.mode = track.mode === 'showing' ? 'hidden' : 'showing';
              }
            }}
          >
            Toggle Captions
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TCOVideoPlayer;
