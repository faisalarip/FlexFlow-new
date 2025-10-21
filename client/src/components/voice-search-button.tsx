import { useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VoiceSearchButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export default function VoiceSearchButton({ onTranscript, className }: VoiceSearchButtonProps) {
  const { isListening, transcript, isSupported, startListening, stopListening } = useVoiceInput();
  const { toast } = useToast();

  // Update the search query when transcript changes
  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  const handleClick = () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Voice search is not supported in your browser. Try Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
      toast({
        title: "Listening...",
        description: "Speak now to search",
      });
    }
  };

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={isListening ? "default" : "ghost"}
          size="icon"
          onClick={handleClick}
          className={className}
          data-testid={isListening ? "button-stop-voice" : "button-start-voice"}
        >
          {isListening ? (
            <MicOff className="h-4 w-4 animate-pulse" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isListening ? "Stop listening" : "Voice search"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
