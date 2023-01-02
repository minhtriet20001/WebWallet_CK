function acceptWithdraw(codeID) {
  if(confirm('Bạn có chắc muốn phê duyệt giao dịch này không') == true) {
    $.ajax({
      type: "PUT",
      url: "/admin/acceptWithdraw",
      dataType: "json",
      data: { post: codeID },
      cache: false,
      success: function (data) {
        if(data.success) {
          alert(`Giao dịch đã được phê duyệt`);
          window.location.href = '/admin';
        }
        else {
          console.log(data);
          alert(data.err);
        }
      },
    });
  }
}
function acceptTransfer(codeID) {
  if(confirm('Bạn có chắc muốn phê duyệt giao dịch này không') == true) {
    $.ajax({
      type: "PUT",
      url: "/admin/acceptTransfer",
      dataType: "json",
      data: { post: codeID },
      cache: false,
      success: function (data) {
        if(data.success) {
          alert(`Giao dịch đã được phê duyệt`);
          window.location.href = '/admin';
        }
        else {
          console.log(data);
          alert(data.err);
        }
      },
    });
  }
}
$(function () {
  function updatePreview(input, target) {
    let file = input.files[0];
    let reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = function () {
      let img = document.getElementById(target);
      // can also use "this.result"
      console.log(img);
      img.src = reader.result;
    };
  }
  $('.btn-minus').on('click', function(e) {
    let number = $('.number-card').html();
    if(parseInt(number) > 1) {
      $('.number-card').text((parseInt(number) - 1).toString());
    }else {
      $('.number-card').text("1");
    }
  });

  $('.btn-plus').on('click', function(e) {
    let number = $('.number-card').html();
    if(parseInt(number) > 0  && parseInt(number) < 5) {
      $('.number-card').text((parseInt(number) + 1).toString());
    }
  });
  $('#select-card').on('change', function(e) {
    var selected = document.getElementById("select-card");
    var imgUrl = "";
    if (selected.value == "viettel") {
        imgUrl = "images/img/card/viettel.png";
    } else if (selected.value == "mobifone") {
        imgUrl = "images/img/card/mobifone.png";
    } else if (selected.value == "vinaphone"){
        imgUrl = "images/img/card/vinaphone.png";
    }
    if (selected.value != "") {
      document.getElementById("myImg").src = imgUrl;
    }
    else {
      document.getElementById("myImg").src = "images/img/hero-bg-abstract.jpg";
    }
  });
  $(".btn-buy-card").on('click', function(e) {
    e.preventDefault();
    let number = $('.number-card').html();
    let nameCard = $('#select-card').val();
    let priceCard = $('#price-card').val();
    $.ajax({
      type: "POST",
      url: "/users/buycard",
      data: {numberCard: number, nameCard: nameCard, priceCard: priceCard},
      // codeTransaction: codeTransaction,
      // status: "Thành công",
      // nameCard: nameCard,
      // quantity: numberCard,
      // sumFeeBuy: feeBuy,
      // listBuyCard: listBuyCard,
      success: function(data) {
        if(data.msg) {
          alert(data.msg)
        }
        else {
          let order = data.order;
          let listCard = order.listBuyCard;
          let code = ``;
          for (let i = 0; i < listCard.length; i++) {
            let codeCard = listCard[i];
            code += `<div>${codeCard}</div>`;
          }
          $('.code-trans').html(`${order.codeTransaction}`);
          $('.code-card').html(code);
          $('.name-card').html(order.nameCard);
          $('.quantity-card').html(order.quantity);
          $('.sum-fee').html(order.sumFeeBuy);
          $('#select-card').val("");
          $('#price-card').val("");
          $('.number-card').text("1");
          document.getElementById("myImg").src = "images/img/hero-bg-abstract.jpg";
          $("#modal-card").modal('show');
        }
      }
    });
  });

  $('.btn-destroy').on('click', function(e) {
    let username = $('.input-username').val();
    let fullname = $('.input-fullname').val();
    e.preventDefault();
    if (confirm(`Bạn có chắc muốn vô hiệu hóa người dùng ${fullname} không ?`) == true)
    {
      $.ajax({
        type: "PUT",
        url: "/admin/destroy",
        dataType: "json",
        data: { post: username },
        cache: false,
        success: function (data) {
          if(data.success) {
            alert(`Người dùng ${fullname} đã bị vô hiệu hóa`);
            window.location.href = '/admin';
          }
          else {
            alert(data.err);
          }
        },
      });
    }
  });

  $('.btn-unlock').on('click', function(e) {
    let username = $('.input-username').val();
    let fullname = $('.input-fullname').val();
    e.preventDefault();
    if (confirm(`Bạn có chắc muốn mở khóa người dùng ${fullname} không ?`) == true)
    {
      $.ajax({
        type: "PUT",
        url: "/admin/unlock",
        dataType: "json",
        data: { post: username },
        cache: false,
        success: function (data) {
          if(data.success) {
            alert(`Người dùng ${fullname} đã được mở khóa`);
            window.location.href = '/admin';
          }
          else {
            alert(data.err);
          }
        },
      });
    }
  });

  $('.btn-update-status').on('click', function(e) {
    let username = $('.input-username').val();
    let fullname = $('.input-fullname').val();
    e.preventDefault();
    if (confirm(`Bạn có chắc muốn cập nhật người dùng ${fullname} không ?`) == true)
    {
      $.ajax({
        type: "PUT",
        url: "/admin/update",
        dataType: "json",
        data: { post: username },
        cache: false,
        success: function (data) {
          if(data.success) {
            alert(`Người dùng ${fullname} đã được yêu cầu cập nhật`)
            window.location.href = '/admin'; 
          }
          else {
            alert(data.err);
          }
        },
      });
    }
  });

  $('.btn-accept').on('click', function(e) {
    let username = $('.input-username').val();
    let fullname = $('.input-fullname').val();
    e.preventDefault();
    if (confirm(`Bạn có chắc muốn phê duyệt người dùng ${fullname} không ?`) == true)
    {
      $.ajax({
        type: "PUT",
        url: "/admin/accept",
        dataType: "json",
        data: { post: username },
        cache: false,
        success: function (data) {
          if(data.success) {
            alert(`Người dùng ${fullname} đã được phê duyệt`);
            window.location.href = '/admin';
          }
          else {
            alert(data.err);
          }
        },
      });
    }
  });
  
  $("#phone-transfer").on("change", function (e) {
    let value = $("#phone-transfer").val();

    $.ajax({
      type: "POST",
      url: "/users/phonenumber",
      dataType: "json",
      data: { post: value },
      cache: false,
      success: function (data) {
        console.log(data);
        $(".label-transfer").text(data.name);
      },
    });
  });

  $('.money-transfer').on('change', function(e) {
    let money = $('.money-transfer').val();
    $.ajax({
      type: "POST",
      url: "/users/fee",
      dataType: "json",
      data: { post: money },
      cache: false,
      success: function (data) {
        
        $(".fee-transfer").val(data.fee);
      },
    });
  });
  $(".toast").toast("show");
  $("#exampleModal").modal({
    keyboard: false,
    backdrop: "static",
  });
  $("#exampleModal").modal("show");
  if (!!window.performance && window.performance.navigation.type === 2) {
    $(".toast").toast("hide");
  }
  $("#imageFront").on("change", function (e) {
    updatePreview(this, "imgFront");
  });
  $("#imageBack").on("change", function (e) {
    updatePreview(this, "imgBack");
  });

  const mobileNavShow = document.querySelector(".mobile-nav-show");

  const mobileNavHide = document.querySelector(".mobile-nav-hide");

  var swiper = new Swiper(".mySwiper", {
    slidesPerView: 3,
    spaceBetween: 30,
    loop: true,
    initialSlide: 2,
    speed: 1000,
    autoplay: {
      delay: 1200,
      disableOnInteraction: false,
    },

    breakpoints: {
      320: {
        slidesPerView: 1,
      },
      480: {
        slidesPerView: 2,
      },
      768: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
    },
  });
  document.querySelectorAll(".mobile-nav-toggle").forEach((el) => {
    el.addEventListener("click", function (event) {
      event.preventDefault();
      mobileNavToogle();
    });
  });

  function mobileNavToogle() {
    document.querySelector("body").classList.toggle("mobile-nav-active");

    mobileNavShow.classList.toggle("d-none");
    mobileNavHide.classList.toggle("d-none");
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll("#navbar a").forEach((navbarlink) => {
    if (!navbarlink.hash) return;

    let section = document.querySelector(navbarlink.hash);
    if (!section) return;

    navbarlink.addEventListener("click", () => {
      if (document.querySelector(".mobile-nav-active")) {
        mobileNavToogle();
      }
    });
  });

  /**
   * Toggle mobile nav dropdowns
   */
  const navDropdowns = document.querySelectorAll(".navbar .dropdown > a");

  navDropdowns.forEach((el) => {
    el.addEventListener("click", function (event) {
      if (document.querySelector(".mobile-nav-active")) {
        event.preventDefault();
        this.classList.toggle("active");
        this.nextElementSibling.classList.toggle("dropdown-active");

        let dropDownIndicator = this.querySelector(".dropdown-indicator");
        dropDownIndicator.classList.toggle("bi-chevron-up");
        dropDownIndicator.classList.toggle("bi-chevron-down");
      }
    });
  });

  const selectHeader = document.querySelector("#header");
  if (selectHeader) {
    let headerOffset = selectHeader.offsetTop;
    let nextElement = selectHeader.nextElementSibling;

    const headerFixed = () => {
      if (headerOffset - window.scrollY <= 0) {
        selectHeader.classList.add("sticked");
        if (nextElement) nextElement.classList.add("sticked-header-offset");
      } else {
        selectHeader.classList.remove("sticked");
        if (nextElement) nextElement.classList.remove("sticked-header-offset");
      }
    };
    window.addEventListener("load", headerFixed);
    document.addEventListener("scroll", headerFixed);
  }
  // button tăng giảm số lượng

  const plus = document.querySelector(".plus"),
    minus = document.querySelector(".minus"),
    num = document.querySelector(".num");
  let a = 1;
  plus.addEventListener("click", () => {
    a++;
    a = a < 5 ? "0" + a : "05";
    num.innerText = a;
  });

  minus.addEventListener("click", () => {
    if (a > 1) {
      a--;
      a = a < 10 ? "0" + a : a;
      num.innerText = a;
    }
  });

  //popup

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = document.querySelectorAll("#navbar a");

  function navbarlinksActive() {
    navbarlinks.forEach((navbarlink) => {
      if (!navbarlink.hash) return;

      let section = document.querySelector(navbarlink.hash);
      if (!section) return;

      let position = window.scrollY + 200;

      if (
        position >= section.offsetTop &&
        position <= section.offsetTop + section.offsetHeight
      ) {
        navbarlink.classList.add("active");
      } else {
        navbarlink.classList.remove("active");
      }
    });
  }
  window.addEventListener("load", navbarlinksActive);
  document.addEventListener("scroll", navbarlinksActive);

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: ".glightbox",
  });

  /**
   * Scroll top button
   */
  const scrollTop = document.querySelector(".scroll-top");
  if (scrollTop) {
    const togglescrollTop = function () {
      window.scrollY > 100
        ? scrollTop.classList.add("active")
        : scrollTop.classList.remove("active");
    };
    window.addEventListener("load", togglescrollTop);
    document.addEventListener("scroll", togglescrollTop);
    scrollTop.addEventListener(
      "click",
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    );
  }

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Clients Slider
   */
  new Swiper(".clients-slider", {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    slidesPerView: "auto",
    pagination: {
      el: ".swiper-pagination",
      type: "bullets",
      clickable: true,
    },
    breakpoints: {
      320: {
        slidesPerView: 2,
        spaceBetween: 40,
      },
      480: {
        slidesPerView: 3,
        spaceBetween: 60,
      },
      640: {
        slidesPerView: 4,
        spaceBetween: 80,
      },
      992: {
        slidesPerView: 6,
        spaceBetween: 120,
      },
    },
  });

  /**
   * Init swiper slider with 1 slide at once in desktop view
   */
  new Swiper(".slides-1", {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    slidesPerView: "auto",
    pagination: {
      el: ".swiper-pagination",
      type: "bullets",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

  /**
   * Init swiper slider with 3 slides at once in desktop view
   */
  new Swiper(".slides-3", {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    slidesPerView: "auto",
    pagination: {
      el: ".swiper-pagination",
      type: "bullets",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 40,
      },

      1200: {
        slidesPerView: 3,
      },
    },
  });

  /**
   * Porfolio isotope and filter
   */
  let portfolionIsotope = document.querySelector(".portfolio-isotope");

  if (portfolionIsotope) {
    let portfolioFilter = portfolionIsotope.getAttribute(
      "data-portfolio-filter"
    )
      ? portfolionIsotope.getAttribute("data-portfolio-filter")
      : "*";
    let portfolioLayout = portfolionIsotope.getAttribute(
      "data-portfolio-layout"
    )
      ? portfolionIsotope.getAttribute("data-portfolio-layout")
      : "masonry";
    let portfolioSort = portfolionIsotope.getAttribute("data-portfolio-sort")
      ? portfolionIsotope.getAttribute("data-portfolio-sort")
      : "original-order";

    window.addEventListener("load", () => {
      let portfolioIsotope = new Isotope(
        document.querySelector(".portfolio-container"),
        {
          itemSelector: ".portfolio-item",
          layoutMode: portfolioLayout,
          filter: portfolioFilter,
          sortBy: portfolioSort,
        }
      );

      let menuFilters = document.querySelectorAll(
        ".portfolio-isotope .portfolio-flters li"
      );
      menuFilters.forEach(function (el) {
        el.addEventListener(
          "click",
          function () {
            document
              .querySelector(
                ".portfolio-isotope .portfolio-flters .filter-active"
              )
              .classList.remove("filter-active");
            this.classList.add("filter-active");
            portfolioIsotope.arrange({
              filter: this.getAttribute("data-filter"),
            });
            if (typeof aos_init === "function") {
              aos_init();
            }
          },
          false
        );
      });
    });
  }

  /**
   * Animation on scroll function and init
   */
  function aos_init() {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  }
  window.addEventListener("load", () => {
    aos_init();
  });

  document.getElementById("liveToastBtn").onclick = function () {
    var toastElList = [].slice.call(document.querySelectorAll(".toast"));
    var toastList = toastElList.map(function (toastEl) {
      // Creates an array of toasts (it only initializes them)
      return new bootstrap.Toast(toastEl); // No need for options; use the default options
    });
    toastList.forEach((toast) => toast.show()); // This show them

    console.log(toastList); // Testing to see if it works
  };

  function OTPInput() {
    const inputs = document.querySelectorAll("#otp > *[id]");
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener("keydown", function (event) {
        if (event.key === "Backspace") {
          inputs[i].value = "";
          if (i !== 0) inputs[i - 1].focus();
        } else {
          if (i === inputs.length - 1 && inputs[i].value !== "") {
            return true;
          } else if (event.keyCode > 47 && event.keyCode < 58) {
            inputs[i].value = event.key;
            if (i !== inputs.length - 1) inputs[i + 1].focus();
            event.preventDefault();
          } else if (event.keyCode > 64 && event.keyCode < 91) {
            inputs[i].value = String.fromCharCode(event.keyCode);
            if (i !== inputs.length - 1) inputs[i + 1].focus();
            event.preventDefault();
          }
        }
      });
    }
  }
  OTPInput();
});
