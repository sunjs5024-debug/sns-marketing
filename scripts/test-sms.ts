// Node 로 UTF-8 정확히 보내서 SMS 파서 검증
const SECRET = "2b14953f36b279235b7fdb32b9d216f9391f5e2be79a6c53cca3d7912040fa9d";
const URL = "https://xn--sns-yg9lh0pw9l.kr/api/charge/webhook/sms";

const TESTS = [
  { from: "1577-9999", text: "[Web발신] [신한] 100,000원 입금 홍길동님 잔액 1,234,567원" },
  { from: "1599-9999", text: "[국민] 입금 50,000원 김민수 잔액 500,000원" },
  { text: "[카카오뱅크] 박지영님 30,000원 입금" },
  { text: "[토스뱅크] 입금 25,000원 (이수진) 잔액 100,000원" },
];

for (const sms of TESTS) {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8", "X-SMS-Token": SECRET },
    body: JSON.stringify(sms),
  });
  const data = await res.json();
  console.log(`📩 "${sms.text}"`);
  console.log(`   → ${JSON.stringify(data)}\n`);
}
