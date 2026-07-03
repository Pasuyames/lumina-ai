import "server-only";
import { GoogleGenAI } from "@google/genai";
import { serverEnv } from "@/lib/env";

/** Tekil Gemini istemcisi (sunucu tarafı). */
let _client: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!_client) {
    _client = new GoogleGenAI({ apiKey: serverEnv.geminiApiKey() });
  }
  return _client;
}
