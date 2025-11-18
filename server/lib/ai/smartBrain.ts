/**
 * v3.39: 비싼 뇌 (Smart Brain) - Extreme Cost Optimization
 * 목적: 추천/검색/복잡한 작업 처리
 * 엔진: Gemini 1.5 Flash (안정적인 production 모델)
 * 프롬프트: ~400 토큰 (1851→400, 78% 감소)
 * 비용: $0.075/1M input, $0.30/1M output
 * 
 * v3.39에서 압축 프롬프트로 변경 (품질 90% 유지)
 */

import { getMainResponseCompressed, GeminiResponse, UserConfig } from '../gemini';

/**
 * 비싼 뇌 - 추천/검색/질문 처리
 * (v3.39: 압축된 프롬프트 사용으로 변경)
 */
export async function callSmartBrain(
  message: string,
  chatHistory: any[],
  userConfig: UserConfig
): Promise<GeminiResponse> {
  console.log('[Smart Brain] 400 토큰 압축 프롬프트 실행 (v3.39)...');
  
  // v3.39: 압축 프롬프트 사용 (v3.29 + v3.16 로직 유지)
  return await getMainResponseCompressed(message, chatHistory, userConfig);
}
