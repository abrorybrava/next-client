export const formatRupiah = (price: string): String => {
    const number = parseFloat(price);
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
    }).format(number);
};

export const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    const daysname = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthname = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
    const year = d.getFullYear();
    console.log(d.getMonth())
    const month = monthname[d.getMonth()]
    const day = String(d.getDate()).padStart(2, '0'); // Tambahkan leading zero jika hari < 10
    const hari = daysname[d.getDay()]
    return `${hari}, ${day} ${month} ${year}`;
};