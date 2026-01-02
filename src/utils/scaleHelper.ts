export const getScale = (windowWidth: number): number => {
  // Mobile (< 768px)
  if (windowWidth < 768) {
    return 0.35;  // 40% - board bude 400px namiesto 1000px
  }
  
  // Tablet (768px - 1200px)
  if (windowWidth < 1200) {
    return 0.6;  // 70% - board bude 700px
  }
  
  // Desktop (1200px+)
  return 1;
};






