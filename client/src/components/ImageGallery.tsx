/**
 * v4.1: Image Gallery Component
 * 매거진 스타일 3x3 그리드 갤러리 (클릭 시 풀스크린 확대)
 */

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageGalleryProps {
  images: string[];
  title?: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  return (
    <>
      {/* 3x3 Grid Gallery */}
      <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden">
        {images.slice(0, 9).map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className="relative aspect-video overflow-hidden bg-muted group cursor-pointer"
          >
            <img
              src={image}
              alt={`${title || 'Movie'} scene ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          </button>
        ))}
      </div>

      {/* Fullscreen Dialog */}
      <Dialog 
        open={selectedIndex !== null} 
        onOpenChange={(open) => !open && setSelectedIndex(null)}
      >
        <DialogContent 
          className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0"
          onKeyDown={handleKeyDown}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 z-20 rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-20 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
              {selectedIndex !== null && `${selectedIndex + 1} / ${images.length}`}
            </div>

            {/* Previous Button */}
            {selectedIndex !== null && selectedIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="absolute left-4 z-20 rounded-full bg-black/50 hover:bg-black/70 text-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}

            {/* Image */}
            {selectedIndex !== null && (
              <img
                src={images[selectedIndex]}
                alt={`${title || 'Movie'} scene ${selectedIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Next Button */}
            {selectedIndex !== null && selectedIndex < images.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-4 z-20 rounded-full bg-black/50 hover:bg-black/70 text-white"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
