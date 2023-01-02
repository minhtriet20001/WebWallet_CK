var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var hbs = require("express-handlebars");
const session = require("express-session");
var db = require("./db/connect");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var notifyRouter = require("./routes/notify");
var adminRouter = require("./routes/admin");
const { type } = require("os");

db.Connect();
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs.engine({
    defaultLayout: "layout",
    extname: "hbs",
    helpers: {
      class_status: (status) => {
        if (status == "Thành công") {
          return `mode_on`;
        }
        return `mode_process`;
      },
      getDate: (date_history) => {
        let fulltime = new Date(date_history);
        let date = fulltime.getDate();
        let month = fulltime.getMonth();
        let year = fulltime.getFullYear();
        return date + "/" + month + "/" + year;
      },
      getCards: (Other) => {
        let cards = Other.codePhone;
        let name = Other.nameTelecom;
        let code = "";
        for (let i = 0; i < cards.length; i++) {
          let codeCard = cards[i];
          code += `<div>${codeCard}</div>`;
        }
        return `<div>${name}</div>` + code;
      },
      class_status_modal: (status) => {
        if (status == "Thành công") {
          return `bg-success`;
        }
        return `bg-warning`;
      },

      get_status: (status) => {
        if (status == "waitConfirm") return "Chờ duyệt";
        else if (status == "waitUpdate") return "Chờ cập nhật";
        else if (status == "bannedMany") return "Khóa";
        else if (status == "destroy") return "Vô hiệu hóa";
        else return "Đã duyệt";
      },

      get_btn: (status) => {
        if (status == "waitConfirm" || status == "waitUpdate")
          return `<div class="form-group mt-3">
      <button class="btn btn-danger btn-destroy mr-2">Vô hiệu hóa</button>
      <button class="btn btn-primary btn-update-status mr-2">Cập nhật</button>
      <button class="btn btn-success btn-accept mr-2">Duyệt</button>
    </div>`;
        else if (status == "bannedMany")
          return `<div class="form-group mt-3">
        <button class="btn btn-danger mr-2 btn-destroy">Vô hiệu hóa</button>
        <button class="btn btn-success mr-2 btn-unlock">Mở khóa</button>
      </div>`;
        else if (status == "destroy") return ``;
        else
          return `<div class="form-group mt-3">
          <button class="btn btn-danger btn-destroy mr-2">Vô hiệu hóa</button>
          <button class="btn btn-primary btn-update-status mr-2">Cập nhật</button>
    </div>`;
      },

      get_class_history: (type) => {
        if (type == 'Nạp tiền') {
          return 'success'
        }
        return 'danger';
      },

      get_tag: (type) => {
        if (type == 'Nạp tiền') {
          return '+'
        }
        return '-';
      },
      get_status_history: (status) => {
        if (status == 'Đang chờ duyệt') {
          return "Đang chờ duyệt"
        }
        else return "Thành công"
      }
    },
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: "KingNope" }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/notifys", notifyRouter);
app.use("/admin", adminRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
