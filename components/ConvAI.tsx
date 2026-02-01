"use client";

import { Button } from "@/components/ui/button";
import { LiveWaveform } from "@/components/ui/live-waveform";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { useState, useEffect } from "react";
import { BackgroundAura } from "@/components/background-aura";
import { cn } from "@/lib/utils";
import { useConversation } from "@elevenlabs/react";
import { toast } from "sonner";

async function requestMicrophonePermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch {
    console.error("Microphone permission denied");
    return false;
  }
}

async function getSignedUrl(): Promise<string> {
  const response = await fetch("/api/signed-url");
  if (!response.ok) {
    throw Error("Failed to get signed url");
  }
  const data = await response.json();
  return data.signedUrl;
}

export function ConvAI() {
  const [agentMessage, setAgentMessage] = useState(
    "你好懂播撒u ousted 你好懂播撒u ousted 你好懂播撒u ousted 你好懂播撒u ousted 你好懂播撒u ousted 你好懂播撒u ousted 你好懂播撒u ousted 你好懂播撒u ousted 你好懂播撒u ousted 你好懂播撒u ousted 你好懂播撒u ousted ",
  );

  const { status, isSpeaking, startSession, endSession } = useConversation({
    onError: (error) => {
      console.error(error);
      toast.error("An error occurred during the conversation");
    },
    onMessage: ({ message, role }) => {
      console.log(message);
      if (role === "agent") {
        setAgentMessage(message);
      }
    },
  });

  useEffect(() => {
    if (!isSpeaking) {
      setAgentMessage("");
    }
  }, [isSpeaking]);

  const [isStarting, setIsStarting] = useState(false);
  const isConnected = status === "connected";
  const isConnecting = status === "connecting";
  const isLoading = isStarting || isConnecting;

  async function startConversation() {
    setIsStarting(true);
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        toast.error("Microphone permission denied");
        setIsStarting(false);
        return;
      }
      const signedUrl = await getSignedUrl();
      await startSession({
        signedUrl: signedUrl,
      });
    } catch (error) {
      toast.error("Failed to start conversation");
    } finally {
      setIsStarting(false);
    }
  }

  async function endConversation() {
    await endSession();
  }

  return (
    <div className={"fixed inset-0 overflow-hidden flex flex-col items-center justify-center"}>
      <BackgroundAura />

      <div className="z-10 flex flex-col items-center justify-center flex-1">
        <div className={"text-center mb-8"}>
          <h2 className="text-2xl font-semibold text-foreground/80 flex justify-center">
            {isConnected ? (
              isSpeaking ? (
                <div className="max-w-[600px] whitespace-normal break-words text-center">
                  {agentMessage || "Agent is speaking..."}
                </div>
              ) : (
                "Agent is listening"
              )
            ) : (
              "Disconnected"
            )}
          </h2>
        </div>

        <div
          className={cn(
            "relative w-48 h-48 my-8 rounded-full overflow-hidden transition-all duration-500 border-4",
            isConnected
              ? "border-green-400/50 shadow-[0_0_40px_rgba(74,222,128,0.4)] scale-105"
              : "border-white/10 grayscale opacity-70 scale-100",
          )}
        >
          <Image src="/avatar.png" alt="Agent Avatar" fill className="object-cover" priority />
        </div>

        <div className="h-24 w-full max-w-md flex items-center justify-center">
          <LiveWaveform
            active={isConnected}
            height={60}
            className="animate-in fade-in zoom-in duration-500"
          />
        </div>
      </div>

      <div className="z-10 mb-12 flex gap-4">
        {!isConnected ? (
          <Button
            variant={"outline"}
            className={"rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"}
            size={"lg"}
            disabled={isConnected || isLoading}
            onClick={startConversation}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting...
              </span>
            ) : (
              "Start conversation"
            )}
          </Button>
        ) : (
          <Button
            variant={"destructive"}
            className={"rounded-full"}
            size={"lg"}
            disabled={!isConnected}
            onClick={endConversation}
          >
            End conversation
          </Button>
        )}
      </div>

      <style jsx>{`
        @keyframes drift {
          0% {
            transform: translateX(-10%) scale(1);
          }
          100% {
            transform: translateX(10%) scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
