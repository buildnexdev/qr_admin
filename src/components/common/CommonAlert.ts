import Swal from 'sweetalert2';

export const triggerAlert = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'success') => {
  return Swal.fire({
    title,
    text,
    icon,
    background: '#19140E', // var(--surface) equivalent
    color: '#fef3c7', // var(--cream) equivalent
    confirmButtonColor: '#ea580c', // var(--ember) equivalent
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
    background: '#1f1810',
    color: '#fef3c7',
    iconColor: icon === 'error' ? '#f87171' : '#f59e0b',
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
    background: '#19140E',
    color: '#fef3c7',
    confirmButtonColor: '#ea580c',
    cancelButtonColor: 'rgba(255,255,255,0.1)',
    confirmButtonText: 'Yes, proceed!'
  });
};
