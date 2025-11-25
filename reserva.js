Webflow.push(function() {
  $(document).ready(function() {
    
    // Detectar idioma/região
    const lang = document.documentElement.lang || 'pt';
    const isEnglish = lang === 'en';
    
    // Calcular placeholders
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Funções de formatação de data (mantidas)
    const formatDateForDisplay = (date) => {
      const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
      
      if (isEnglish) {
        const month = (utcDate.getMonth() + 1).toString().padStart(2, '0');
        const day = utcDate.getDate().toString().padStart(2, '0');
        const year = utcDate.getFullYear();
        return `${month}/${day}/${year}`;
      } else {
        const day = utcDate.getDate().toString().padStart(2, '0');
        const month = (utcDate.getMonth() + 1).toString().padStart(2, '0');
        const year = utcDate.getFullYear();
        return `${day}/${month}/${year}`;
      }
    };
    
    const convertToRegionalFormat = (dateString) => {
      const parts = dateString.split('-');
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);
      
      if (isEnglish) {
        const monthStr = (month + 1).toString().padStart(2, '0');
        const dayStr = day.toString().padStart(2, '0');
        return `${monthStr}/${dayStr}/${year}`;
      } else {
        const dayStr = day.toString().padStart(2, '0');
        const monthStr = (month + 1).toString().padStart(2, '0');
        return `${dayStr}/${monthStr}/${year}`;
      }
    };
    
    // Função para converter Date para formato ISO (YYYY-MM-DD)
    const dateToISO = (date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // Definir placeholders regionais
    $('#checkin').attr('placeholder', formatDateForDisplay(today));
    $('#checkout').attr('placeholder', formatDateForDisplay(tomorrow));
    
    // Input invisível para o calendário
    $('body').append('<input type="text" class="calendar-trigger" id="calendar-trigger">');
    
    // Variáveis globais
    let rangePicker;
    let checkinISO = '';
    let checkoutISO = '';
    let adultsCount = 1;
    let childrenCount = 0;
    let modalOpen = false;
    
    // Configurar Flatpickr
    rangePicker = flatpickr("#calendar-trigger", {
      mode: "range",
      dateFormat: "Y-m-d",
      allowInput: false,
      minDate: "today",
      closeOnSelect: true,
      defaultDate: null,
      firstDayOfWeek: 0,
      appendTo: document.querySelector('.reservation-wrap'),
      static: false,
      onChange: function(selectedDates) {
        if (selectedDates.length === 1) {
          checkinISO = flatpickr.formatDate(selectedDates[0], "Y-m-d");
          checkoutISO = '';
          $('#checkin').val(convertToRegionalFormat(checkinISO));
          $('#checkout').val('');
        } else if (selectedDates.length === 2) {
          checkinISO = flatpickr.formatDate(selectedDates[0], "Y-m-d");
          checkoutISO = flatpickr.formatDate(selectedDates[1], "Y-m-d");
          
          if (selectedDates[1] <= selectedDates[0]) {
            const errorMsg = isEnglish ? 'Check-out must be after check-in' : 'Check-out deve ser após check-in';
            alert(errorMsg);
            rangePicker.clear();
            $('#checkin').val('');
            $('#checkout').val('');
            checkinISO = '';
            checkoutISO = '';
            return;
          }
          
          $('#checkin').val(convertToRegionalFormat(checkinISO));
          $('#checkout').val(convertToRegionalFormat(checkoutISO));
        }
      }
    });
    
    // Função para atualizar texto dos contadores
    const updateCounterText = () => {
      let adultsText, childrenText;
      
      if (isEnglish) {
        adultsText = adultsCount === 1 ? '1 Adult' : `${adultsCount} Adults`;
        childrenText = childrenCount === 0 ? '0 Children' : (childrenCount === 1 ? '1 Child' : `${childrenCount} Children`);
      } else {
        adultsText = adultsCount === 1 ? '1 Adulto' : `${adultsCount} Adultos`;
        childrenText = childrenCount === 0 ? '0 Crianças' : (childrenCount === 1 ? '1 Criança' : `${childrenCount} Crianças`);
      }
      
      // Atualizar os textos dos elementos (não altera os atributos data-*)
      $('[data-adults]').text(adultsText);
      $('[data-child]').text(childrenText);
      
      // Atualizar placeholder do input principal
      $('[data-placeholder]').text(`${adultsText}, ${childrenText}`);
    };
    
    // Função para atualizar botões
    const updateButtons = () => {
      // Botões adultos
      $('.icon-menos.is-adults').toggleClass('disabled', adultsCount <= 1).toggleClass('is-disabled', adultsCount <= 1);
      $('.icon-mais.is-adults').toggleClass('disabled', adultsCount >= 3).toggleClass('is-disabled', adultsCount >= 3);
      
      // Botões crianças
      $('.icon-menos.is-child').toggleClass('disabled', childrenCount <= 0).toggleClass('is-disabled', childrenCount <= 0);
      $('.icon-mais.is-child').toggleClass('disabled', childrenCount >= 2).toggleClass('is-disabled', childrenCount >= 2);
    };
    
    // Abrir calendário
    $('#checkin, #checkout').attr('readonly', true).on('click', function() {
      rangePicker.open();
      gsap.to('#modal-calendar', { rotation: 180, duration: 0.3 });
    });
    
    // Fechar calendário
    $(document).on('click', function(e) {
      if (!$(e.target).closest('.flatpickr-calendar, #checkin, #checkout').length) {
        gsap.to('#modal-calendar', { rotation: 0, duration: 0.3 });
      }
    });
    
    // Abrir modal adultos/crianças
    $('.input.is-reservation.is-adults').on('click', function() {
      if (!modalOpen) {
        gsap.to('.modal-adults-child', {
          autoAlpha: 1,
          pointerEvents: 'auto',
          duration: 0.4,
          ease: 'power2.out'
        });
        gsap.to('#modal-icon', { rotation: 180, duration: 0.3 });
        modalOpen = true;
      } else {
        // Fechar modal
        gsap.to('.modal-adults-child', {
          autoAlpha: 0,
          pointerEvents: 'none',
          duration: 0.4,
          ease: 'power2.in'
        });
        gsap.to('#modal-icon', { rotation: 0, duration: 0.3 });
        modalOpen = false;
      }
    });
    
    // Fechar modal ao clicar fora
    $(document).on('click', function(e) {
      if (modalOpen && !$(e.target).closest('.modal-adults-child, .input.is-reservation.is-adults').length) {
        gsap.to('.modal-adults-child', {
          autoAlpha: 0,
          pointerEvents: 'none',
          duration: 0.4,
          ease: 'power2.in'
        });
        gsap.to('#modal-icon', { rotation: 0, duration: 0.3 });
        modalOpen = false;
      }
    });
    
    // Controles de adultos
    $('.icon-mais.is-adults').on('click', function(e) {
      e.stopPropagation();
      if (adultsCount < 3) {
        adultsCount++;
        updateCounterText();
        updateButtons();
      }
    });
    
    $('.icon-menos.is-adults').on('click', function(e) {
      e.stopPropagation();
      if (adultsCount > 1) {
        adultsCount--;
        updateCounterText();
        updateButtons();
      }
    });
    
    // Controles de crianças
    $('.icon-mais.is-child').on('click', function(e) {
      e.stopPropagation();
      if (childrenCount < 2) {
        childrenCount++;
        updateCounterText();
        updateButtons();
      }
    });
    
    $('.icon-menos.is-child').on('click', function(e) {
      e.stopPropagation();
      if (childrenCount > 0) {
        childrenCount--;
        updateCounterText();
        updateButtons();
      }
    });
    

// Submit do formulário
// Submit do formulário
// Submit do formulário
$("#reservation-form").on("submit", function(e) {
  e.preventDefault();
  
  // Se o usuário não selecionou datas, usar as datas padrão (hoje e amanhã)
  let finalCheckinISO = checkinISO;
  let finalCheckoutISO = checkoutISO;
  
  if (!finalCheckinISO || !finalCheckoutISO) {
    finalCheckinISO = dateToISO(today);
    finalCheckoutISO = dateToISO(tomorrow);
  }
  
  const locale = lang === 'en' ? 'en-US' : 'pt-PT';
  const url = `https://be.synxis.com/?adult=${adultsCount}&arrive=${finalCheckinISO}&chain=10237&child=${childrenCount}&currency=BRL&depart=${finalCheckoutISO}&hotel=41350&level=hotel&locale=${locale}&productcurrency=BRL&rooms=1`;
  
  // 👉 Agora abre em uma nova aba com segurança
  window.open(url, '_blank', 'noopener,noreferrer');
});
        
    // Inicializar estado
    updateCounterText();
    updateButtons();
    
    // Configurar posição inicial do modal
   gsap.set('.modal-adults-child', {
      autoAlpha: 0, 
      pointerEvents: 'none'
    });
    
  });
});
