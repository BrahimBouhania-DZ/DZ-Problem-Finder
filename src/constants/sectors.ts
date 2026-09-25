export const SECTORS = [
  { id: 'company', label: 'شركة/مؤسسة', icon: 'Building2', color: '#3B82F6' },
  { id: 'accounting', label: 'محاسبة/جباية', icon: 'Receipt', color: '#10B981' },
  { id: 'construction', label: 'مقاولات وأشغال', icon: 'HardHat', color: '#F59E0B' },
  { id: 'commerce', label: 'تجارة', icon: 'Store', color: '#8B5CF6' },
  { id: 'workshop', label: 'ورشة وصيانة', icon: 'Wrench', color: '#EF4444' },
  { id: 'health', label: 'صحة', icon: 'Stethoscope', color: '#EC4899' },
  { id: 'veterinary', label: 'بيطرة/فلاحة', icon: 'Cow', color: '#84CC16' },
  { id: 'training', label: 'تكوين/تعليم', icon: 'GraduationCap', color: '#0EA5E9' },
  { id: 'hotel', label: 'فندق/إقامة', icon: 'Hotel', color: '#F43F5E' },
  { id: 'travel', label: 'سياحة وأسفار', icon: 'Plane', color: '#06B6D4' },
  { id: 'realestate', label: 'عقار/دراسات', icon: 'Home', color: '#6366F1' },
  { id: 'hr', label: 'موارد بشرية/توظيف', icon: 'Users', color: '#A855F7' },
  { id: 'other', label: 'أخرى', icon: 'Shapes', color: '#64748B' },
] as const

export type SectorId = (typeof SECTORS)[number]['id']

export const getSector = (id: string) => SECTORS.find((s) => s.id === id)
