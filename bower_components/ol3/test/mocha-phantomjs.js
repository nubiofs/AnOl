// Generated by CoffeeScript 1.6.3
(function() {
  var Doc, Dot, HtmlCov, Json, JsonCov, List, Min, Reporter, Spec, Tap, Teamcity, USAGE, Xunit, config, error, reporter, reporterKlass, reporterString, s, system, webpage,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  system = require('system');

  webpage = require('webpage');

  USAGE = "Usage: phantomjs mocha-phantomjs.coffee URL REPORTER [CONFIG]";

  Reporter = (function() {
    function Reporter(reporter, config) {
      this.reporter = reporter;
      this.config = config;
      this.checkStarted = __bind(this.checkStarted, this);
      this.waitForRunMocha = __bind(this.waitForRunMocha, this);
      this.waitForInitMocha = __bind(this.waitForInitMocha, this);
      this.waitForMocha = __bind(this.waitForMocha, this);
      this.url = system.args[1];
      this.columns = parseInt(system.env.COLUMNS || 75) * .75 | 0;
      this.mochaStarted = false;
      this.mochaStartWait = this.config.timeout || 6000;
      this.startTime = Date.now();
      if (!this.url) {
        this.fail(USAGE);
      }
    }

    Reporter.prototype.run = function() {
      this.initPage();
      return this.loadPage();
    };

    Reporter.prototype.customizeRunner = function(options) {
      return void 0;
    };

    Reporter.prototype.customizeProcessStdout = function(options) {
      return void 0;
    };

    Reporter.prototype.customizeConsole = function(options) {
      return void 0;
    };

    Reporter.prototype.customizeOptions = function() {
      return {
        columns: this.columns
      };
    };

    Reporter.prototype.fail = function(msg, errno) {
      if (msg) {
        console.log(msg);
      }
      return phantom.exit(errno || 1);
    };

    Reporter.prototype.finish = function() {
      return phantom.exit(this.page.evaluate(function() {
        return mochaPhantomJS.failures;
      }));
    };

    Reporter.prototype.initPage = function() {
      var name, value, _ref,
        _this = this;
      this.page = webpage.create({
        settings: this.config.settings
      });
      if (this.config.headers) {
        this.page.customHeaders = this.config.headers;
      }
      _ref = this.config.cookies;
      for (name in _ref) {
        value = _ref[name];
        this.page.addCookie({
          name: name,
          value: value
        });
      }
      if (this.config.viewportSize) {
        this.page.viewportSize = this.config.viewportSize;
      }
      this.page.onConsoleMessage = function(msg) {
        return console.log(msg);
      };
      return this.page.onInitialized = function() {
        return _this.page.evaluate(function() {
          return window.mochaPhantomJS = {
            failures: 0,
            ended: false,
            started: false,
            run: function() {
              mochaPhantomJS.started = true;
              return window.callPhantom('mochaPhantomJS.run');
            }
          };
        });
      };
    };

    Reporter.prototype.loadPage = function() {
      var _this = this;
      this.page.open(this.url);
      this.page.onLoadFinished = function(status) {
        _this.page.onLoadFinished = function() {};
        if (status !== 'success') {
          _this.onLoadFailed();
        }
        return _this.waitForInitMocha();
      };
      return this.page.onCallback = function(data) {
        if (data === 'mochaPhantomJS.run') {
          if (_this.injectJS()) {
            return _this.waitForRunMocha();
          }
        }
      };
    };

    Reporter.prototype.onLoadFailed = function() {
      return this.fail("Failed to load the page. Check the url: " + this.url);
    };

    Reporter.prototype.injectJS = function() {
      if (this.page.evaluate(function() {
        return window.mocha != null;
      })) {
        this.page.injectJs('mocha-phantomjs/core_extensions.js');
        this.page.evaluate(this.customizeProcessStdout, this.customizeOptions());
        this.page.evaluate(this.customizeConsole, this.customizeOptions());
        return true;
      } else {
        this.fail("Failed to find mocha on the page.");
        return false;
      }
    };

    Reporter.prototype.runMocha = function() {
      if (this.config.useColors === false) {
        this.page.evaluate(function() {
          return Mocha.reporters.Base.useColors = false;
        });
      }
      this.page.evaluate(this.runner, this.reporter);
      this.mochaStarted = this.page.evaluate(function() {
        return mochaPhantomJS.runner || false;
      });
      if (this.mochaStarted) {
        this.mochaRunAt = new Date().getTime();
        this.page.evaluate(this.customizeRunner, this.customizeOptions());
        return this.waitForMocha();
      } else {
        return this.fail("Failed to start mocha.");
      }
    };

    Reporter.prototype.waitForMocha = function() {
      var ended;
      ended = this.page.evaluate(function() {
        return mochaPhantomJS.ended;
      });
      if (ended) {
        return this.finish();
      } else {
        return setTimeout(this.waitForMocha, 100);
      }
    };

    Reporter.prototype.waitForInitMocha = function() {
      if (!this.checkStarted()) {
        return setTimeout(this.waitForInitMocha, 100);
      }
    };

    Reporter.prototype.waitForRunMocha = function() {
      if (this.checkStarted()) {
        return this.runMocha();
      } else {
        return setTimeout(this.waitForRunMocha, 100);
      }
    };

    Reporter.prototype.checkStarted = function() {
      var started;
      started = this.page.evaluate(function() {
        return mochaPhantomJS.started;
      });
      if (!started && this.mochaStartWait && this.startTime + this.mochaStartWait < Date.now()) {
        this.fail("Failed to start mocha: Init timeout", 255);
      }
      return started;
    };

    Reporter.prototype.runner = function(reporter) {
      var cleanup, error, _ref, _ref1;
      try {
        mocha.setup({
          reporter: reporter
        });
        mochaPhantomJS.runner = mocha.run();
        if (mochaPhantomJS.runner) {
          cleanup = function() {
            mochaPhantomJS.failures = mochaPhantomJS.runner.failures;
            return mochaPhantomJS.ended = true;
          };
          if ((_ref = mochaPhantomJS.runner) != null ? (_ref1 = _ref.stats) != null ? _ref1.end : void 0 : void 0) {
            return cleanup();
          } else {
            return mochaPhantomJS.runner.on('end', cleanup);
          }
        }
      } catch (_error) {
        error = _error;
        return false;
      }
    };

    return Reporter;

  })();

  Spec = (function(_super) {
    __extends(Spec, _super);

    function Spec(config) {
      Spec.__super__.constructor.call(this, 'spec', config);
    }

    Spec.prototype.customizeProcessStdout = function(options) {
      return process.stdout.write = function(string) {
        if (string === process.cursor.deleteLine || string === process.cursor.beginningOfLine) {
          return;
        }
        return console.log(string);
      };
    };

    Spec.prototype.customizeConsole = function(options) {
      var origLog;
      process.cursor.CRMatcher = /\s+◦\s\S/;
      process.cursor.CRCleaner = process.cursor.up + process.cursor.deleteLine;
      origLog = console.log;
      return console.log = function() {
        var string;
        string = console.format.apply(console, arguments);
        if (string.match(process.cursor.CRMatcher)) {
          process.cursor.CRCleanup = true;
        } else if (process.cursor.CRCleanup) {
          string = process.cursor.CRCleaner + string;
          process.cursor.CRCleanup = false;
        }
        return origLog.call(console, string);
      };
    };

    return Spec;

  })(Reporter);

  Dot = (function(_super) {
    __extends(Dot, _super);

    function Dot(config) {
      Dot.__super__.constructor.call(this, 'dot', config);
    }

    Dot.prototype.customizeProcessStdout = function(options) {
      process.cursor.margin = 2;
      process.cursor.CRMatcher = /\u001b\[\d\dm\․\u001b\[0m/;
      process.stdout.columns = options.columns;
      process.stdout.allowedFirstNewLine = false;
      return process.stdout.write = function(string) {
        var forward;
        if (string === '\n  ') {
          if (!process.stdout.allowedFirstNewLine) {
            process.stdout.allowedFirstNewLine = true;
          } else {
            return;
          }
        } else if (string.match(process.cursor.CRMatcher)) {
          if (process.cursor.count === process.stdout.columns) {
            process.cursor.count = 0;
            forward = process.cursor.margin;
            string = process.cursor.forwardN(forward) + string;
          } else {
            forward = process.cursor.margin + process.cursor.count;
            string = process.cursor.up + process.cursor.forwardN(forward) + string;
          }
          ++process.cursor.count;
        }
        return console.log(string);
      };
    };

    return Dot;

  })(Reporter);

  Tap = (function(_super) {
    __extends(Tap, _super);

    function Tap(config) {
      Tap.__super__.constructor.call(this, 'tap', config);
    }

    return Tap;

  })(Reporter);

  List = (function(_super) {
    __extends(List, _super);

    function List(config) {
      List.__super__.constructor.call(this, 'list', config);
    }

    List.prototype.customizeProcessStdout = function(options) {
      return process.stdout.write = function(string) {
        if (string === process.cursor.deleteLine || string === process.cursor.beginningOfLine) {
          return;
        }
        return console.log(string);
      };
    };

    List.prototype.customizeProcessStdout = function(options) {
      var origLog;
      process.cursor.CRMatcher = /\u001b\[90m.*:\s\u001b\[0m/;
      process.cursor.CRCleaner = function(string) {
        return process.cursor.up + process.cursor.deleteLine + string + process.cursor.up + process.cursor.up;
      };
      origLog = console.log;
      return console.log = function() {
        var string;
        string = console.format.apply(console, arguments);
        if (string.match(/\u001b\[32m\s\s-\u001b\[0m/)) {
          string = string;
          process.cursor.CRCleanup = false;
        }
        if (string.match(process.cursor.CRMatcher)) {
          process.cursor.CRCleanup = true;
        } else if (process.cursor.CRCleanup) {
          string = process.cursor.CRCleaner(string);
          process.cursor.CRCleanup = false;
        }
        return origLog.call(console, string);
      };
    };

    return List;

  })(Reporter);

  Min = (function(_super) {
    __extends(Min, _super);

    function Min(config) {
      Min.__super__.constructor.call(this, 'min', config);
    }

    return Min;

  })(Reporter);

  Doc = (function(_super) {
    __extends(Doc, _super);

    function Doc(config) {
      Doc.__super__.constructor.call(this, 'doc', config);
    }

    return Doc;

  })(Reporter);

  Teamcity = (function(_super) {
    __extends(Teamcity, _super);

    function Teamcity(config) {
      Teamcity.__super__.constructor.call(this, 'teamcity', config);
    }

    return Teamcity;

  })(Reporter);

  Xunit = (function(_super) {
    __extends(Xunit, _super);

    function Xunit(config) {
      Xunit.__super__.constructor.call(this, 'xunit', config);
    }

    return Xunit;

  })(Reporter);

  Json = (function(_super) {
    __extends(Json, _super);

    function Json(config) {
      Json.__super__.constructor.call(this, 'json', config);
    }

    return Json;

  })(Reporter);

  JsonCov = (function(_super) {
    __extends(JsonCov, _super);

    function JsonCov(config) {
      JsonCov.__super__.constructor.call(this, 'json-cov', config);
    }

    return JsonCov;

  })(Reporter);

  HtmlCov = (function(_super) {
    __extends(HtmlCov, _super);

    function HtmlCov(config) {
      HtmlCov.__super__.constructor.call(this, 'html-cov', config);
    }

    return HtmlCov;

  })(Reporter);

  reporterString = system.args[2] || 'spec';

  reporterString = ((function() {
    var _i, _len, _ref, _results;
    _ref = reporterString.split('-');
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      s = _ref[_i];
      _results.push("" + (s.charAt(0).toUpperCase()) + (s.slice(1)));
    }
    return _results;
  })()).join('');

  reporterKlass = (function() {
    try {
      return eval(reporterString);
    } catch (_error) {
      error = _error;
      return void 0;
    }
  })();

  config = JSON.parse(system.args[3] || '{}');

  if (reporterKlass) {
    reporter = new reporterKlass(config);
    reporter.run();
  } else {
    console.log("Reporter class not implemented: " + reporterString);
    phantom.exit(1);
  }

}).call(this);
