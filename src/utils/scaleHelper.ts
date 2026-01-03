export const getScale = (windowWidth: number): number => {
  // mobil (< 768px)
  if (windowWidth < 768) {
    return 0.35;  // 40% board 
  }
  
  // tablet (768px - 1200px)
  if (windowWidth < 1200) {
    return 0.6;  // 70% board
  }
  
  // desktop (1200px+)
  return 1;   // plna velkost
};






