<script>
  if (!window.tailwind) {
    document.write('<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"><\/script>');
  }
</script>

<!-- BEGIN: Header Layout General -->
<div class="hidden lg:flex justify-end items-center px-8 py-2 gap-6 border-b border-white/10 text-xs font-bold mx-auto w-full bg-sersig-dark-blue text-white">
  <div class="flex items-center gap-2">
    <span class="material-symbols-outlined text-sm">phone</span>
    <span>311 534 4811</span>
  </div>
  <div class="flex items-center gap-2">
    <span class="material-symbols-outlined text-sm">schedule</span>
    <span>Lun - Vie: 7:00 am - 5:00 pm</span>
  </div>
</div>

<header class="bg-white shadow-sm relative z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-24">
      <!-- Logo -->
      <div class="flex-shrink-0 flex items-center">
        <a class="flex items-center gap-3" href="#">
          <div class="w-33 h-33 flex items-center justify-center overflow-hidden">
            <img alt="SERSIG Logo" class="w-20 h-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCMcEBQfrZKbPdQTp7BlEnZ1v-v7WYw6g5_EJvIVUkjJmBuFCyk74axp6Ra7b3jCTNqgT-nu-P_UXU0Ae2n6yl89NKcqJ4ZQUlQH5Z_enHIvCc1NFS1WYVYPxxnAwdbJ_0xEBwMNaQCQNdy5RtTo2L4UDVhusLgrgixTAj0KsVNSGjZQDdLXgUnSGMBkjONylRLG8SgFk3iptpfGL1P000aNAan0nUeVP2eZlsv1CdbdNRt98nqAVn_HQbgnpnavbtPwydf3JPOTzW">
          </div>
        </a>
      </div>
      <!-- Desktop Navigation -->
      <nav class="hidden md:flex space-x-8">
        <a class="text-sersig-blue font-semibold border-b-2 border-sersig-blue pb-1 text-sm tracking-wide" href="#">INICIO</a>
        <a class="text-gray-600 hover:text-sersig-blue font-semibold transition-colors text-sm tracking-wide" href="#">NOSOTROS</a>
        <div class="relative group cursor-pointer">
          <a class="text-gray-600 hover:text-sersig-blue font-semibold flex items-center transition-colors text-sm tracking-wide" href="#">
            SERVICIOS <i class="fas fa-chevron-down ml-1 text-xs"></i>
          </a>
        </div>
        <a class="text-gray-600 hover:text-sersig-blue font-semibold transition-colors text-sm tracking-wide" href="#calculadora">CALCULADORA</a>
        <a class="text-gray-600 hover:text-sersig-blue font-semibold transition-colors text-sm tracking-wide" href="#">CONTACTO</a>
      </nav>
      <!-- Contact Info & CTA -->
      <div class="hidden lg:flex items-center space-x-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-sersig-blue">
            <i class="fas fa-phone-alt"></i>
          </div>
          <div class="flex flex-col">
            <span class="font-display font-bold text-lg text-gray-900 leading-tight">311 534 4811</span>
            <span class="text-xs text-gray-500 font-medium">Lun - Vie: 7:00 am - 5:00 pm</span>
          </div>
        </div>
        <a class="bg-sersig-blue hover:bg-blue-800 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center text-sm tracking-wide shadow-lg shadow-blue-900/20" href="#">COTIZAR AHORA</a>
      </div>
      <!-- Mobile menu button -->
      <div class="md:hidden flex items-center">
        <button class="text-gray-600 hover:text-gray-900 focus:outline-none">
          <i class="fas fa-bars text-2xl"></i>
        </button>
      </div>
    </div>
  </div>
</header>
<!-- END: Header Layout General -->
