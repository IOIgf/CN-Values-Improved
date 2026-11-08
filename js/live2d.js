// 美化版看板娘 - 使用开源Live2D模型
$(document).ready(function() {
    // 添加看板娘HTML结构
    const live2dHtml = `
    <div id="waifu-toggle" class="waifu-toggle" title="显示看板娘">
        <span>看板娘</span>
    </div>
    <div id="waifu" class="waifu">
        <div class="waifu-tips" id="waifu-tips"></div>
        <canvas id="live2d-canvas" class="live2d-canvas" width="280" height="360"></canvas>
        <div class="waifu-tool">
            <span class="waifu-btn" id="waifu-clothes" title="换衣服">👗</span>
            <span class="waifu-btn" id="waifu-dragon" title="戳一戳">👉</span>
            <span class="waifu-btn" id="waifu-star" title="拍照">📷</span>
            <span class="waifu-btn" id="waifu-chat" title="说句话">💬</span>
            <span class="waifu-btn" id="waifu-cross" title="隐藏">❌</span>
        </div>
    </div>
    `;
    $('body').append(live2dHtml);

    // 提示语库
    const tips = {
        "welcome": [
            "欢迎来到CN Values政治立场测试~ 我是你的政治向导小绿！",
            "你好呀！来测测你的政治立场吧，说不定会有惊喜哦~",
            "终于等到你了！快来开始测试吧，我在这里等你完成~"
        ],
        "index": [
            "点击大按钮就可以开始测试啦，题目虽然多，但很快就做完了~",
            "测试题目都是随机排序的，所以不会受前面题目的影响哦",
            "记得按照第一感觉选择哦，想太多反而不准啦"
        ],
        "quiz": [
            "根据你的真实想法选择就好啦~",
            "如果摇摆不定的话，跟着直觉走吧！",
            "有160多道题哦，慢慢选，不要着急~",
            "觉得选的不对？可以点前一题回去改哦"
        ],
        "result": [
            "测试完成！让我看看你的政治坐标是什么~",
            "哇，你的结果出来了！看看和你想的一样吗？",
            "结果仅供娱乐哦，不要太较真啦~",
            "雷达图看起来很直观吧？可以分享给朋友一起玩！"
        ],
        "click": [
            "哎呀，不要随便碰人家啦！",
            "你戳到我了啦~ (>_<)",
            "哼，再戳我就不理你了！",
            "奇怪的人...",
            "呜呜呜，欺负人",
            "再戳要收费了哦~"
        ],
        "copy": [
            "你复制了什么内容呀？记得注明出处哦~",
            "转载请记得保留原地址呀~"
        ],
        "visibility": [
            "你终于回来了！我等你好久了~",
            "不要不声不响地离开嘛，我会担心的"
        ],
        "idle": [
            "在干嘛呢~ 还不开始测试吗？",
            "发什么呆呀~",
            "要不要休息一下眼睛？",
            "有问题随时可以戳我哦"
        ]
    };

    // 随机选择提示
    function showTip(type) {
        const tipsList = tips[type];
        if (!tipsList) return;
        const text = tipsList[Math.floor(Math.random() * tipsList.length)];
        const $tips = $('#waifu-tips');
        $tips.text(text).addClass('waifu-tips-show');
        setTimeout(() => {
            $tips.removeClass('waifu-tips-show');
        }, 5000);
    }

    // 页面识别
    let pageType = 'welcome';
    if (location.pathname.includes('quiz')) {
        pageType = 'quiz';
    } else if (location.pathname.includes('results')) {
        pageType = 'result';
    } else if (location.pathname === '/' || location.pathname.includes('index')) {
        pageType = 'index';
    }

    // 欢迎提示
    setTimeout(() => {
        showTip(pageType);
    }, 1000);

    // 欢迎提示
    setTimeout(() => {
        showTip('welcome');
    }, 2000);

    // 空闲提示
    setInterval(() => {
        if (Math.random() < 0.1) {
            showTip('idle');
        }
    }, 30000);

    // 点击看板娘反应
    $('#waifu').click(() => {
        showTip('click');
    });

    // 复制提示
    $(document).on('copy', () => {
        showTip('copy');
    });

    // 标签页切换提示
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            showTip('visibility');
        }
    });

    // 工具栏按钮功能
    $('#waifu-cross').click((e) => {
        e.stopPropagation();
        $('#waifu').animate({bottom: '-500px'}, 500);
        setTimeout(() => {
            $('#waifu-toggle').addClass('waifu-toggle-show');
        }, 500);
    });

    $('#waifu-toggle').click(() => {
        $('#waifu-toggle').removeClass('waifu-toggle-show');
        $('#waifu').animate({bottom: '0'}, 500);
        showTip('welcome');
    });

    $('#waifu-chat').click((e) => {
        e.stopPropagation();
        showTip(pageType);
    });

    $('#waifu-dragon').click((e) => {
        e.stopPropagation();
        showTip('click');
        // 简单动画效果
        $('#live2d-canvas').animate({rotate: '5deg'}, 100)
            .animate({rotate: '-5deg'}, 100)
            .animate({rotate: '0'}, 100);
    });

    $('#waifu-clothes').click((e) => {
        e.stopPropagation();
        changeDressColor();
        showTip('click');
    });

    $('#waifu-star').click((e) => {
        e.stopPropagation();
        showTip('result');
    });

    // ========== 内置SVG看板娘（不依赖外部资源，美观可爱） ==========
    
    let dressColor = '#009688'; // 默认青绿色（teal）
    const dressColors = ['#009688', '#e91e63', '#9c27b0', '#3f51b5', '#03a9f4', '#f44336', '#ff9800', '#8bc34a'];
    
    function changeDressColor() {
        const currentIndex = dressColors.indexOf(dressColor);
        dressColor = dressColors[(currentIndex + 1) % dressColors.length];
        drawWaifu();
    }

    function drawWaifu() {
        const canvas = document.getElementById('live2d-canvas');
        if (!canvas || !canvas.getContext) return;
        
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        
        ctx.clearRect(0, 0, w, h);
        
        // 位置参数
        const centerX = w / 2;
        const startY = h - 20;
        
        // ===== 身体/衣服 =====
        ctx.fillStyle = dressColor;
        // 连衣裙主体
        ctx.beginPath();
        ctx.moveTo(centerX - 60, startY);
        ctx.quadraticCurveTo(centerX - 80, startY - 120, centerX - 45, startY - 140);
        ctx.lineTo(centerX + 45, startY - 140);
        ctx.quadraticCurveTo(centerX + 80, startY - 120, centerX + 60, startY);
        ctx.closePath();
        ctx.fill();
        
        // 衣服褶皱/阴影
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.moveTo(centerX - 35, startY - 140);
        ctx.quadraticCurveTo(centerX - 50, startY - 80, centerX - 40, startY);
        ctx.lineTo(centerX - 15, startY);
        ctx.quadraticCurveTo(centerX - 20, startY - 80, centerX - 25, startY - 140);
        ctx.closePath();
        ctx.fill();
        
        // 衣领
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(centerX - 25, startY - 140);
        ctx.lineTo(centerX, startY - 120);
        ctx.lineTo(centerX + 25, startY - 140);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 领结
        ctx.fillStyle = '#ff4081';
        ctx.beginPath();
        ctx.moveTo(centerX - 15, startY - 125);
        ctx.lineTo(centerX, startY - 118);
        ctx.lineTo(centerX + 15, startY - 125);
        ctx.lineTo(centerX, startY - 112);
        ctx.closePath();
        ctx.fill();
        
        // ===== 脖子 =====
        ctx.fillStyle = '#ffe0bd';
        ctx.beginPath();
        ctx.ellipse(centerX, startY - 145, 18, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // ===== 头发（后部） =====
        ctx.fillStyle = '#4a3728';
        ctx.beginPath();
        ctx.ellipse(centerX, startY - 200, 75, 90, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 双马尾
        ctx.fillStyle = '#4a3728';
        // 左马尾
        ctx.beginPath();
        ctx.ellipse(centerX - 70, startY - 160, 22, 55, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // 右马尾
        ctx.beginPath();
        ctx.ellipse(centerX + 70, startY - 160, 22, 55, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // 马尾发带
        ctx.fillStyle = '#ff4081';
        ctx.beginPath();
        ctx.ellipse(centerX - 70, startY - 200, 18, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + 70, startY - 200, 18, 8, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // ===== 脸 =====
        ctx.fillStyle = '#ffe0bd';
        ctx.beginPath();
        ctx.ellipse(centerX, startY - 200, 55, 65, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 头发刘海
        ctx.fillStyle = '#4a3728';
        ctx.beginPath();
        ctx.moveTo(centerX - 55, startY - 210);
        ctx.quadraticCurveTo(centerX - 50, startY - 170, centerX - 30, startY - 165);
        ctx.quadraticCurveTo(centerX - 10, startY - 185, centerX + 5, startY - 160);
        ctx.quadraticCurveTo(centerX + 25, startY - 180, centerX + 45, startY - 165);
        ctx.quadraticCurveTo(centerX + 55, startY - 180, centerX + 55, startY - 210);
        ctx.closePath();
        ctx.fill();
        
        // 呆毛
        ctx.beginPath();
        ctx.moveTo(centerX + 5, startY - 265);
        ctx.quadraticCurveTo(centerX + 20, startY - 285, centerX + 25, startY - 270);
        ctx.quadraticCurveTo(centerX + 15, startY - 260, centerX, startY - 255);
        ctx.fill();
        
        // ===== 眼睛 =====
        // 眼白
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(centerX - 22, startY - 205, 12, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + 22, startY - 205, 12, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 瞳孔（青绿色，和主题色呼应）
        const eyeColor = dressColor;
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.ellipse(centerX - 22, startY - 203, 8, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + 22, startY - 203, 8, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 瞳孔高光
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(centerX - 19, startY - 208, 3, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + 25, startY - 208, 3, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // 睫毛/上眼线
        ctx.strokeStyle = '#2d1f14';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX - 22, startY - 205, 12, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX + 22, startY - 205, 12, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
        
        // ===== 腮红 =====
        ctx.fillStyle = 'rgba(255, 150, 180, 0.5)';
        ctx.beginPath();
        ctx.ellipse(centerX - 35, startY - 185, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + 35, startY - 185, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // ===== 嘴巴 =====
        ctx.strokeStyle = '#d88a8a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, startY - 175, 6, 0, Math.PI);
        ctx.stroke();
        
        // ===== 手臂 =====
        ctx.fillStyle = '#ffe0bd';
        // 左手
        ctx.beginPath();
        ctx.ellipse(centerX - 55, startY - 100, 12, 30, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // 右手
        ctx.beginPath();
        ctx.ellipse(centerX + 55, startY - 100, 12, 30, 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // 袖子和衣服同色
        ctx.fillStyle = dressColor;
        ctx.beginPath();
        ctx.ellipse(centerX - 55, startY - 125, 14, 12, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + 55, startY - 125, 14, 12, 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // ===== 头上的装饰（小叶子/发饰） =====
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.ellipse(centerX - 40, startY - 260, 12, 7, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#81c784';
        ctx.beginPath();
        ctx.ellipse(centerX - 35, startY - 270, 8, 5, -0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛高光闪烁动画
        ctx.fillStyle = '#ffffff';
        const sparkle = Math.sin(Date.now() / 300) > 0.8;
        if (sparkle) {
            ctx.beginPath();
            ctx.arc(centerX - 24, startY - 210, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + 20, startY - 210, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 初始绘制
    drawWaifu();
    
    // 简单呼吸/眨眼动画循环
    let blinkTimer = 0;
    function animate() {
        blinkTimer++;
        // 每3秒左右眨一次眼
        if (blinkTimer % 180 === 0) {
            const canvas = document.getElementById('live2d-canvas');
            const ctx = canvas.getContext('2d');
            const cx = canvas.width / 2;
            const sy = canvas.height - 20;
            // 闭眼 - 画一条线代替睁着的眼睛
            drawWaifu();
            ctx.save();
            ctx.fillStyle = '#ffe0bd';
            ctx.fillRect(cx - 32, sy - 210, 20, 8);
            ctx.fillRect(cx + 12, sy - 210, 20, 8);
            ctx.strokeStyle = '#2d1f14';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx - 32, sy - 206);
            ctx.lineTo(cx - 12, sy - 206);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx + 12, sy - 206);
            ctx.lineTo(cx + 32, sy - 206);
            ctx.stroke();
            ctx.restore();
            
            setTimeout(() => {
                drawWaifu();
            }, 150);
        }
        requestAnimationFrame(animate);
    }
    animate();

});
