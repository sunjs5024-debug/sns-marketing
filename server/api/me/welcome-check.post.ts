// 가입 환영 모달 1회 표시 — hasSeenWelcome 가 false 면 true 로 바꾸고 welcome:true 반환.
// 이메일/OAuth 가입 무관하게 "신규 계정 첫 홈 진입"에 정확히 한 번만 true.
import { prisma } from "../../utils/prisma";
import { requireUserId } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);

  // 원자적으로 false→true 전환. 바뀐 행 수가 1이면 "처음" → 환영 표시.
  const res = await prisma.user.updateMany({
    where: { id: userId, hasSeenWelcome: false },
    data: { hasSeenWelcome: true },
  });

  return { welcome: res.count === 1 };
});
