import Swal from 'sweetalert2';

export const triggerAlert = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'success') => {
  return Swal.fire({
    title,
    text,
    icon,
    background: 'var(--surface)', // var(--surface) equivalent
    color: 'var(--cream)', // var(--cream) equivalent
    confirmButtonColor: 'var(--ember)', // var(--ember) equivalent
    customClass: {
      popup: 'glass-container'
    }
  });
};

export const triggerToast = (
  title: string,
  icon: 'success' | 'error' | 'warning' | 'info' = 'success',
  text?: string
) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: icon === 'error' ? 4500 : 3200,
    timerProgressBar: true,
    background: 'var(--card)',
    color: 'var(--cream)',
    iconColor: icon === 'error' ? '#f87171' : 'var(--amber)',
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  return Toast.fire({
    icon,
    title,
    ...(text ? { text } : {}),
  });
};

export const confirmAlert = async (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    background: 'var(--surface)',
    color: 'var(--cream)',
    confirmButtonColor: 'var(--ember)',
    cancelButtonColor: 'rgba(255,255,255,0.1)',
    confirmButtonText: 'Yes, proceed!'
  });
};

