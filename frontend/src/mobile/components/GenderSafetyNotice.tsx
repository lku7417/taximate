export default function GenderSafetyNotice({ compact = false }: { compact?: boolean }) {
  return <details open={!compact} className="rounded-xl border border-current/10 px-3 py-2 text-[0.75rem] leading-relaxed">
    <summary className="cursor-pointer font-semibold">성별·신원 정보와 피해 예방 안내</summary>
    <p className="mt-2">성별은 선택 정보이며 동승 조건으로 사용하지 않아요. 본인이 입력한 정보는 신원 인증이나 안전을 보장하지 않아요.</p>
    <p className="mt-1">성별·신원 정보를 고의로 속여 다른 사람에게 피해를 주는 행위는 금지돼요. 허위 정보나 피해가 의심되면 방 또는 메시지의 신고 기능으로 알려 주세요. 운영자가 확인 후 이용 제한 등 필요한 조치를 검토해요.</p>
    {!compact && <p className="mt-1">신고는 긴급 구조 요청이 아니에요. 만날 장소의 접근성·조명·주변 상황을 직접 확인하고 불안하면 탑승하지 마세요.</p>}
  </details>;
}
