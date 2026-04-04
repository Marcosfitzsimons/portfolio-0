const gradients = [
  "linear-gradient(135deg, #1e1b4b 0%, #7c3aed 50%, #a855f7 100%)",
  "linear-gradient(135deg, #312e81 0%, #6d28d9 50%, #c084fc 100%)",
  "linear-gradient(135deg, #1e1b4b 0%, #9333ea 50%, #e879f9 100%)",
  "linear-gradient(135deg, #0f172a 0%, #6366f1 50%, #a78bfa 100%)",
  "linear-gradient(135deg, #1a1a2e 0%, #8b5cf6 50%, #d946ef 100%)",
  "linear-gradient(135deg, #0c0a1d 0%, #4c1d95 50%, #7c3aed 100%)",
  "linear-gradient(135deg, #170b2e 0%, #be185d 50%, #a855f7 100%)",
  "linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #818cf8 100%)",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getProjectGradient(title: string): string {
  return gradients[hashString(title) % gradients.length];
}
