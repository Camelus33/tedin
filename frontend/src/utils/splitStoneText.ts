// Utility to split text into up to three lines for stone rendering
export function splitStoneText(text: string): string[] {
  // Split into characters (handles Unicode code points)
  const chars = Array.from(text);
  const len = chars.length;

  // 1~4 chars: single line
  if (len <= 4) {
    return [text];
  }
  // 5~8 chars: two lines (ceil half on first line)
  if (len <= 8) {
    const firstLen = Math.ceil(len / 2);
    const first = chars.slice(0, firstLen).join('');
    const second = chars.slice(firstLen).join('');
    return [first, second];
  }
  // 9~10 chars: three lines (3, len-6, 3)
  if (len <= 10) {
    const middleLen = len - 6; // for 9->3, 10->4
    const first = chars.slice(0, 3).join('');
    const second = chars.slice(3, 3 + middleLen).join('');
    const third = chars.slice(3 + middleLen).join('');
    return [first, second, third];
  }
  // More than 10: reject (no lines)
  return [];
} 