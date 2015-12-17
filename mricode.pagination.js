/*!
 * Mricode Pagination Plugin
 * Github: https://github.com/mricle/Mricode.Pagination
 * Version: 1.3.1
 * 
 * Required jQuery
 * 
 * Copyright 2015 Mricle
 * Released under the MIT license
 */

(function ($) {
    "use strict";

    var Page = function (element, options) {
        var defaultOption = {
            pageIndex: 0,
            pageSize: 10,
            total: 0,
            pageBtnCount: 11,
            showFirstLastBtn: true,
            firstBtnText: null,
            lastBtnText: null,
            prevBtnText: "&laquo;",
            nextBtnText: "&raquo;",
            loadFirstPage: true,
            remote: {
                url: null,
                params: null,
                success: null,
                beforeSend: null,
                complete: null,
                pageIndexName: 'pageIndex',
                pageSizeName: 'pageSize',
                totalName: 'total',
                traditional: false
            },
            showInfo: false,
            infoFormat: '{start} ~ {end} of {total} entires',
            noInfoText: '0 entires',
            showJump: false,
            jumpBtnText: 'Go',
            showPageSizes: false,
            pageSizeItems: [5, 10, 15, 20],
            debug: false
        }
        this.$element = $(element);
        this.$page = $('<ul class="m-pagination-page"></ul>');
        this.$size = $('<div class="m-pagination-size"></div>');
        this.$jump = $('<div class="m-pagination-jump"></div>');
        this.$info = $('<div class="m-pagination-info"></div>');
        this.options = $.extend(true, {}, defaultOption, $.fn.pagination.defaults, options);
        if (options.pageSizeItems) {
            this.options.pageSizeItems = options.pageSizeItems;
        }
        this.total = this.options.total;
        this.currentUrl = this.options.remote.url;
        this.currentPageIndex = utility.convertInt(this.options.pageIndex);
        this.currentPageSize = utility.convertInt(this.options.pageSize);
        this.currentParams = utility.deserializeParams(this.options.remote.params) || {};
        this.getLastPageNum = function () {
            return pagination.core.calLastPageNum(this.total, this.currentPageSize);
        }
        if (this.options.remote.success === null) {
            this.options.remote.success = this.options.remote.callback;
        }
        this.init();
    }

    Page.prototype = {
        getPageIndex: function () {
            return this.currentPageIndex;
        },
        setPageIndex: function (pageIndex) {
            if (pageIndex !== undefined && pageIndex !== null) {
                this.currentPageIndex = utility.convertInt(pageIndex);
            }
        },
        setPageSize: function (pageSize) {
            if (pageSize !== undefined && pageSize !== null) {
                this.currentPageSize = utility.convertInt(pageSize);
            }
        },
        setRemoteUrl: function (url) {
            if (url) {
                this.currentUrl = url;
            }
        },
        setParams: function (params) {
            if (params) {
                this.currentParams = utility.deserializeParams(params);
            }
        },
        render: function (total) {
            if (total !== undefined && total !== null) {
                this.total = utility.convertInt(total);
            }
            this.renderPagination();
            this.debug('pagination rendered');
        },
        init: function () {
            this.initHtml();
            this.initEvent();
            if (this.currentUrl && this.options.loadFirstPage) {
                this.remote();
            } else {
                this.renderPagination();
            }
            this.debug('pagination inited');
        },
        initHtml: function () {
            //init size module
            var sizeHtml = $('<select data-page-btn="size"></select>');
            for (var i = 0; i < this.options.pageSizeItems.length; i++) {
                sizeHtml.append('<option value="' + this.options.pageSizeItems[i] + '" ' + (this.currentPageSize == this.options.pageSizeItems[i] ? "selected" : "") + ' >' + this.options.pageSizeItems[i] + '</option>')
            }
            sizeHtml.val(this.currentPageSize);
            this.$size.append(sizeHtml);

            //init jump module
            var jumpHtml = '<div class="m-pagination-group"><input data-page-btn="jump" type="text"><button data-page-btn="jump" type="button">' + this.options.jumpBtnText + '</button></div>';
            this.$jump.append(jumpHtml);

            this.$element.append(this.$page.hide());
            this.$element.append(this.$size.hide());
            this.$element.append(this.$jump.hide());
            this.$element.append(this.$info.hide());
        },
        initEvent: function () {
            this.$element
            .on('click', { page: this }, function (event) {
                eventHandler.call(event.data.page, event);
            })
            .on('change', { page: this }, function (event) {
                if ($(event.target).data('pageBtn') == 'jump') {
                    if (!pagination.check.checkJumpPage(this.value, event.data.page.getLastPageNum()))
                        this.value = null;
                    return false;
                }
                eventHandler.call(event.data.page, event);
            });
        },

        doPagination: function () {
            if (this.currentUrl) {
                this.remote();
            } else {
                this.renderPagination();
            }
        },
        remote: function () {
            this.currentParams[this.options.remote.pageIndexName] = this.currentPageIndex;
            this.currentParams[this.options.remote.pageSizeName] = this.currentPageSize;

            pagination.remote.getAjax(this, this.currentUrl, this.currentParams, this.ajaxCallBack, this.options.remote.beforeSend, this.options.remote.complete);
        },

        ajaxCallBack: function (result) {
            var total = utility.mapObjectNameRecursion(result, this.options.remote.totalName);
            if (total == null || total == undefined)
                throw new Error("the response of totalName :  '" + this.options.remote.totalName + "'  not found.");
            total = utility.convertInt(total);
            this.total = total;
            if (typeof this.options.remote.success === 'function') this.options.remote.success(result);
            this.renderPagination();
        },

        onEvent: function (eventName, pageIndex, pageSize) {
            if (pageIndex != null) this.currentPageIndex = utility.convertInt(pageIndex);
            if (pageSize != null) this.currentPageSize = utility.convertInt(pageSize);
            this.doPagination();
            this.$element.trigger(eventName, { pageIndex: this.currentPageIndex, pageSize: this.currentPageSize });
            this.debug('pagination ' + eventName);
        },
        //生成分页
        renderPagination: function () {
            var option = {
                showFirstLastBtn: this.options.showFirstLastBtn,
                firstBtnText: this.options.firstBtnText,
                prevBtnText: this.options.prevBtnText,
                nextBtnText: this.options.nextBtnText,
                lastBtnText: this.options.lastBtnText
            }
            this.$page.empty().append(pagination.core.renderPages(this.currentPageIndex, this.currentPageSize, this.total, this.options.pageBtnCount, option));
            this.$info.text(pagination.core.renderInfo(this.currentPageIndex, this.currentPageSize, this.total, this.options.infoFormat, this.options.noInfoText));
            var lastPageNum = this.getLastPageNum();
            if (this.options.showInfo) this.$info.show();
            else this.$info.hide();
            if (lastPageNum > 1) {
                this.$page.show();
                if (this.options.showPageSizes) this.$size.show();
                if (this.options.showJump) this.$jump.show();
            }
            else {
                this.$page.hide();
                this.$size.hide();
                this.$jump.hide();
            }
        },
        //销毁分页
        destroy: function () {
            this.$element.unbind().data("pagination", null).empty();
            this.debug('pagination destroyed');
        },
        debug: function (message, data) {
            if (this.options.debug && console) {
                message && console.info(message + ' : pageIndex = ' + this.currentPageIndex + ' , pageSize = ' + this.currentPageSize + ' , total = ' + this.total);
                data && console.info(data);
            }
        }
    }

    var eventHandler = function (event) {
        var that = event.data.page;
        var $target = $(event.target);

        if (event.type === 'click' && $target.data('pageIndex') !== undefined && !$target.parent().hasClass('active')) {
            that.onEvent(pagination.event.pageClicked, $target.data("pageIndex"), null);
        }
        else if (event.type === 'click' && $target.data('pageBtn') === 'jump') {
            var pageIndexStr = that.$jump.find('input').val();
            if (pagination.check.checkJumpPage(pageIndexStr, that.getLastPageNum())) {
                that.onEvent(pagination.event.jumpClicked, pageIndexStr - 1, null);
            }
            that.$jump.find('input').val(null);
        }
        else if (event.type === 'change' && $target.data('pageBtn') === 'size') {
            that.onEvent(pagination.event.pageSizeChanged, null, that.$size.find('select').val());
        }
    };

    var pagination = {};
    pagination.event = {
        pageClicked: 'pageClicked',
        jumpClicked: 'jumpClicked',
        pageSizeChanged: 'pageSizeChanged'
    };
    pagination.remote = {
        getAjax: function (pagination, url, data, success, beforeSend, complate) {
            $.ajax({
                url: url,
                dataType: 'json',
                data: data,
                cache: false,
                contentType: 'application/Json',
                beforeSend: function (XMLHttpRequest) {
                    if (typeof beforeSend === 'function') beforeSend.call(this, XMLHttpRequest);
                },
                complete: function (XMLHttpRequest, textStatue) {
                    if (typeof complate === 'function') complate.call(this, XMLHttpRequest, textStatue);
                },
                success: function (result) {
                    success.call(pagination, result);
                }
            })
        }
    };
    pagination.core = {
        /*
        options : {
            showFirstLastBtn
            firstBtnText:
        }
        */
        renderPages: function (pageIndex, pageSize, total, pageBtnCount, options) {
            options = options || {};
            pageIndex = pageIndex == undefined ? 1 : parseInt(pageIndex) + 1;      //set pageIndex from 1， convenient calculation page
            var lastPageNumber = this.calLastPageNum(total, pageSize);
            var html = [];

            if (lastPageNumber <= pageBtnCount) {
                html = this.renderGroupPages(1, lastPageNumber, pageIndex);
            }
            else {
                var firstPage = this.renderPerPage(options.firstBtnText || 1, 0);
                var lastPage = this.renderPerPage(options.lastBtnText || lastPageNumber, lastPageNumber - 1);


                //button count of  both sides
                var symmetryBtnCount = (pageBtnCount - 1 - 4) / 2;
                if (!options.showFirstLastBtn)
                    symmetryBtnCount = symmetryBtnCount + 1;
                var frontBtnNum = (pageBtnCount + 1) / 2;
                var behindBtnNum = lastPageNumber - ((pageBtnCount + 1) / 2);

                var prevPage = this.renderPerPage(options.prevBtnText, pageIndex - 2);
                var nextPage = this.renderPerPage(options.nextBtnText, pageIndex);

                symmetryBtnCount = symmetryBtnCount.toString().indexOf('.') == -1 ? symmetryBtnCount : symmetryBtnCount + 0.5;
                frontBtnNum = frontBtnNum.toString().indexOf('.') == -1 ? frontBtnNum : frontBtnNum + 0.5;
                behindBtnNum = behindBtnNum.toString().indexOf('.') == -1 ? behindBtnNum : behindBtnNum + 0.5;
                if (pageIndex <= frontBtnNum) {
                    if (options.showFirstLastBtn) {
                        html = this.renderGroupPages(1, pageBtnCount - 2, pageIndex);
                        html.push(nextPage);
                        html.push(lastPage);
                    } else {
                        html = this.renderGroupPages(1, pageBtnCount - 1, pageIndex);
                        html.push(nextPage);
                    }
                }
                else if (pageIndex > behindBtnNum) {
                    if (options.showFirstLastBtn) {
                        html = this.renderGroupPages(lastPageNumber - pageBtnCount + 3, pageBtnCount - 2, pageIndex);
                        html.unshift(prevPage);
                        html.unshift(firstPage);
                    } else {
                        html = this.renderGroupPages(lastPageNumber - pageBtnCount + 2, pageBtnCount - 1, pageIndex);
                        html.unshift(prevPage);
                    }
                }
                else {
                    if (options.showFirstLastBtn) {
                        html = this.renderGroupPages(pageIndex - symmetryBtnCount, pageBtnCount - 4, pageIndex);
                        html.unshift(prevPage);
                        html.push(nextPage);
                        html.unshift(firstPage);
                        html.push(lastPage);
                    } else {
                        html = this.renderGroupPages(pageIndex - symmetryBtnCount, pageBtnCount - 2, pageIndex);
                        html.unshift(prevPage);
                        html.push(nextPage);
                    }
                }
            }
            return html;
        },
        renderGroupPages: function (beginPageNum, count, currentPage) {
            var html = [];
            for (var i = 0; i < count; i++) {
                var page = this.renderPerPage(beginPageNum, beginPageNum - 1);
                if (beginPageNum == currentPage)
                    page.addClass("active");
                html.push(page);
                beginPageNum++;
            }
            return html;
        },
        renderPerPage: function (text, value) {
            return $("<li><a data-page-index='" + value + "'>" + text + "</a></li>");
        },
        renderInfo: function (currentPageIndex, currentPageSize, total, infoFormat, noInfoText) {
            if (total <= 0) {
                return noInfoText;
            } else {
                var startNum = (currentPageIndex * currentPageSize) + 1;
                var endNum = (currentPageIndex + 1) * currentPageSize;
                endNum = endNum >= total ? total : endNum;
                return infoFormat.replace('{start}', startNum).replace('{end}', endNum).replace('{total}', total);
            }
        },
        //计算最大分页数
        calLastPageNum: function (total, pageSize) {
            total = utility.convertInt(total);
            pageSize = utility.convertInt(pageSize);
            var i = total / pageSize;
            return utility.isDecimal(i) ? parseInt(i) + 1 : i;
        }
    };
    pagination.check = {
        //校验跳转页数有效性
        checkJumpPage: function (pageIndex, maxPage) {
            var reg = /^\+?[1-9][0-9]*$/;
            return reg.test(pageIndex) && utility.convertInt(pageIndex) <= utility.convertInt(maxPage);
        }
    };

    var utility = {
        //转换为int
        convertInt: function (i) {
            if (typeof i === 'number') {
                return i;
            } else {
                var j = parseInt(i);
                if (!isNaN(j)) {
                    return j;
                } else {
                    throw new Error("convertInt Type Error.  Type is " + typeof i + ', value = ' + i);
                }
            }
        },
        //返回是否小数
        isDecimal: function (i) {
            return parseInt(i) !== i;
        },
        //匹配对象名称（递归）
        mapObjectNameRecursion: function (object, name) {
            var obj = object;
            var arr = name.split('.');
            for (var i = 0; i < arr.length; i++) {
                obj = utility.mapObjectName(obj, arr[i]);
            }
            return obj;
        },
        //匹配对象名称
        mapObjectName: function (object, name) {
            var value = null;
            for (var i in object) {
                //过滤原型属性
                if (object.hasOwnProperty(i)) {
                    if (i == name) {
                        value = object[i];
                        break;
                    }
                }
            }
            return value;
        },
        deserializeParams: function (params) {
            var newParams = {};
            if (typeof params === 'string') {
                var arr = params.split('&');
                for (var i = 0; i < arr.length; i++) {
                    var a = arr[i].split('=');
                    newParams[a[0]] = decodeURIComponent(a[1]);
                }
            }
            else if (params instanceof Array) {
                for (var i = 0; i < params.length; i++) {
                    newParams[params[i].name] = decodeURIComponent(params[i].value);
                }
            }
            else if (typeof params === 'object') {
                newParams = params;
            }
            return newParams;
        }
    }

    var initPagination = function (element, option, args) {
        var $this = $(element);
        var data = $this.data('pagination');
        if (!data && typeof option === 'string') {
            throw new Error('MricodePagination is uninitialized.');
        }
        else if (data && typeof option === 'object') {
            throw new Error('MricodePagination is initialized.');
        }
            //初始化
        else if (!data && typeof option === 'object') {
            var options = typeof option == 'object' && option;
            var data_api_options = $this.data();
            options = $.extend(options, data_api_options);
            $this.data('pagination', (data = new Page(element, options)));
        }
        else if (data && typeof option === 'string') {
            data[option].apply(data, Array.prototype.slice.call(args, 1));
        }
    }

    $.fn.pagination = function (option) {
        if (typeof option === 'undefined') {
            return $(this).data('pagination') || false;
        } else {
            var args = arguments;
            return this.each(function () {
                initPagination(this, option, args);
            });
        }
    }
})(window.jQuery);