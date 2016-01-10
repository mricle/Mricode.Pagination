#mricode.pagination
jQuery 分页插件

##Get Started
引入文件:
```html
<link href="mricode.pagination.css" rel="stylesheet" />
<script src="http://cdn.bootcss.com/jquery/2.1.4/jquery.js"></script>
<script src="mricode.pagination.js"></script>
```

创建分页显示标签
```html
<div id="page" class="m-pagination"></div>
```

初始化插件
```javascript
$("#page").pagination({
    pageSize: 10,
    total: 1000
});
```



##Ajax分页

初始化
```javascript
$("#page").pagination({
    pageSize: 10,
    remote: {
        url: 'data.json',
        success: function (data) {
            // data为ajax返回数据
        },
        totalName:'total'
    }
});
```

remote默认配置

注：pageIndexName和pageSizeName，将在之后版本中移除，请使用pageParams修改请求参数名称
```javascript
remote: {
    url: null,                      //[String]:ajax请求地址
    params: null,                   //[Object]:参数
    pageParams: null,               //[Function]:自定义请求参数
    success: null,                  //[Function]:请求成功回调函数
    beforeSend: null,               //[Function]:请求之前回调函数（同jQuery）
    complete: null,                 //[Function]:请求完成回调函数（同jQuery）
    pageIndexName: 'pageIndex',     //(已过时）[String]:自定义请求参数的当前页名称
    pageSizeName: 'pageSize',       //(已过时）[String]:自定义请求参数的每页数量名称
    totalName: 'total',             //[String]:自定义返回的总页数名称，对象属性可写成'data.total'
    traditional: false              //[Boolean]:参数序列化方式（同jQuery）
}

```

自定义page请求参数（默认为pageIndex, pageSize）
请求地址：www.google.com/search?index=0&size=10
```javascript
remote: {
    url: 'www.google.com/search'
    pageParams: function(data){
        return {
            index:data.pageIndex,
            size:data.pageSize
        };
    }
}
```


##Options

####pageIndex
- Type: `Number`
- Default: `0`

指定当前页数，索引从0开始，默认第1页

####pageSize
- Type: `Number`
- Default: `10`

每页显示数据数

####total
- Type: `Number`
- Default: `0`

总数据数，生成分页则必须配置该属性以生成分页。Ajax分页无需配置该属性。

####pageBtnCount
- Type: `Number`
- Default: `11`

显示分页按钮数，包括首页页和上一页下一个按钮，推荐设置为基数

####showFirstLastBtn
- Type: `Boolean`
- Default: `true`

是否显示首尾页

####firstBtnText
- Type: `String`
- Default: `null`

首页按钮显示文字，不填则显示数字。该属性需设置showFirstLastBtn为true

####lastBtnText
- Type: `String`
- Default: `null`

未页按钮显示文字，不填则显示数字。该属性需设置showFirstLastBtn为true

####prevBtnText
- Type: `String`
- Default: `&laquo;`

上一页按钮显示文字，默认为«

####nextBtnText
- Type: `String`
- Default: `&raquo;`

下一页按钮显示文字，默认为»

####loadFirstPage
- Type: `Boolean`
- Default: `true`

是否加载第一页，页面第一次打开可设置不加载首页数据，首页数据是页面直接返回，之后点击分页按钮自动加载数据


####pageElementSort
- Type: `Array`
- Default: `['$page', '$size', '$jump', '$info']`

page元素排序

'$page':分页按钮

'$size':分页大小

'$jump':跳转按钮

'info':分页信息（1到20条, 共216条数据 ）


####showInfo
- Type: `Boolean`
- Default: `false`

是否显示分页信息

####infoFormat
- Type: `String`
- Default: `{start} ~ {end} of {total} entires`

显示分页信息 {start}：每页显示的第一条数据，{end}:每页显示的最后一条数据，{total}：总数据数

####noInfoText
- Type: `String`
- Default: `0 entires`

没有数据时显示信息

####showJump
- Type: `Boolean`
- Default: `false`

是否显示跳转页

####jumpBtnText
- Type: `String`
- Default: `Go`

跳转按钮显示文字

####showPageSizes
- Type: `Boolean`
- Default: `false`

是否显示选择每页数量

####pageSizeItems
- Type: `Array`
- Default: `[5, 10, 15, 20]`

配置可选每页数量





##Methods

####setPageIndex
```javascript
$("#page").pagination('setPageIndex', pageIndex);
```
- pageIndex:`Number`

####setPageSize
```javascript
$("#page").pagination('setPageSize', pageSize);
```
- pageSize:`Number`

####setRemoteUrl
```javascript
$("#page").pagination('setRemoteUrl', url);
```
- url:`String`

####setParams
```javascript
$("#page").pagination('setParams', params);
```
- params:`Object`

####destroy
```javascript
$("#page").pagination('destroy');
```

####重新生成分页
```javascript
$("#page").pagination('render', [total]);
```
- total:`Number`

####重新发起Ajax请求
```javascript
$("#page").pagination('remote');
```

####判断是否初始化
```javascript
$("#page").pagination();
```
return:`Boolean`


####获取当前pageIndex
```javascript
$("#page").pagination('getPageIndex');
```
return:`Number`





##Events

####pageClicked
```javascript
$("#page").on("pageClicked", function (event, data) {
    //分页按钮点击事件
}
```

####jumpClicked
```javascript
$("#page").on("jumpClicked", function (event, data) {
    //跳转按钮点击事件
}
```

####pageSizeChanged
```javascript
$("#page").on("pageSizeChanged", function (event, data) {
    //页面大小切换事件
}
```
