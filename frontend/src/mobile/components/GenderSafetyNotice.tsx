/**
 * Rooms are split by the gender members report, so deliberately falsifying it defeats the same-gender rule.
 * Shown wherever gender decides who rides together: the gender step, creating a room and joining one.
 */
export default function GenderSafetyNotice({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  return (
    <details open={!compact} className={`rounded-xl border px-3 py-2 text-[0.75rem] leading-relaxed ${dark ? 'border-white/15 text-white/70' : 'border-line bg-white text-mute-dark'}`}>
      <summary className={`cursor-pointer font-semibold ${dark ? 'text-white/85' : 'text-ink'}`}>성별을 속이면 안 돼요 · 피해 예방 안내</summary>
      <p className="mt-2">같은 성별끼리만 동승하도록 회원이 알려 준 성별로 방을 나눠요. 성별은 직접 선택했거나 카카오에서 받아 온 값이고, 운영자가 신분증 등으로 확인하지 않아요.</p>
      <p className="mt-1">같은 성별 방에 들어가려고 성별을 일부러 속이는 행위는 금지돼요. 함께 타는 사람에게 불안과 피해를 줄 수 있어요. 확인되면 이용이 제한되고, 피해를 준 경우 법령에 따라 책임을 질 수 있어요.</p>
      <p className="mt-1">만난 사람이 방 정보와 다르거나 불안하면 함께 타지 말고 방이나 사람을 신고해 주세요.{!compact && ' 신고는 긴급 구조 요청이 아니에요. 위험한 상황에서는 112에 신고하세요.'}</p>
    </details>
  );
}
