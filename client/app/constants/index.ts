export const BASE_API_URL = process.env.BASE_API_URL;
export const taxableSelect = [
  { value: 1, label: 'Yes' },
  { value: 0, label: 'No' },
];
export const infoLinks = [
  { id: 0, name: 'Liên hệ', to: '/contact' },
  { id: 1, name: 'Trở thành đối tác', to: '/sell' },
  { id: 2, name: 'Giao Hàng', to: '/shipping' },
];

export const sortOptions = [
  { value: 0, label: 'Mới nhất' },
  { value: 1, label: 'Giá từ cao tới thấp' },
  { value: 2, label: 'Giá từ thấp tới cao' },
];
