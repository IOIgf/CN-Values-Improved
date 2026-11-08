$(document).ready(() => {

    let econ_arr = ["共产主义", "社会主义", "偏向平等", "中立", "偏向市场", "资本主义", "自由放任"]
    let govt_arr = ["无政府主义", "自由意志主义", "偏向自由", "中立", "偏向专制", "威权主义", "极权主义"]
    let scty_arr = ["变革", "进步", "偏向改良", "中立", "偏向保守", "传统", "反动"]
    let envo_arr = ["深绿", "生态主义", "环保优先", "中立", "发展优先", "生产主义", "环保怀疑主义"]

    initialize();

    $('.fixed-action-btn').floatingActionButton();
    $('.tooltipped').tooltip();
    $('.modal').modal();

    function get_label(val, ary) {
        if (val > 100) {
            return ""
        } else if (val > 90) {
            return ary[0]
        } else if (val > 75) {
            return ary[1]
        } else if (val > 60) {
            return ary[2]
        } else if (val >= 40) {
            return ary[3]
        } else if (val >= 25) {
            return ary[4]
        } else if (val >= 10) {
            return ary[5]
        } else if (val >= 0) {
            return ary[6]
        } else {
            return ""
        }
    }

    function get_value(value_name) {
        let query;
        if (window.location.search) {
            query = window.location.search.substring(1);
        } else {
            query = window.location.hash.substring(1);
        }
        return (new URLSearchParams(query)).get(value_name);
    }

    function set_bar_and_percent(left_name, right_name, value) {
        $("#bar-" + left_name).css({"width": value + "%"})
        $("#percent-" + left_name).html(value + "%")
        $("#percent-" + right_name).html((100 - value) + "%")
    }

    // 计算两个意识形态之间的加权距离
    function calculate_distance(user_scores, ideology) {
        let dist = 0;
        // 四个主要维度权重相同，使用欧氏距离
        dist += Math.pow(Math.abs(ideology.stats.econ - user_scores.econ), 2);
        dist += Math.pow(Math.abs(ideology.stats.govt - user_scores.govt), 2);
        dist += Math.pow(Math.abs(ideology.stats.scty - user_scores.scty), 2);
        dist += Math.pow(Math.abs(ideology.stats.envo - user_scores.envo), 2);
        return Math.sqrt(dist);
    }

    // 将距离转换为相似度百分比 (0-100%)
    function distance_to_similarity(dist) {
        // 最大可能距离：4个维度都是从0到100，所以最大欧氏距离是 sqrt(4*100^2) = 200
        const max_dist = 200;
        let similarity = Math.max(0, 100 * (1 - dist / max_dist));
        return Math.round(similarity);
    }

    // 绘制雷达图
    function draw_radar_chart(econ, govt, scty, envo) {
        const canvas = document.getElementById('radar-chart');
        if (!canvas || !canvas.getContext) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;
        
        // 四个维度的角度 (从顶部开始顺时针)
        const angles = [
            -Math.PI/2,           // 上 - 平等/经济
            -Math.PI/2 + Math.PI/2, // 右 - 自由/政府
            -Math.PI/2 + Math.PI,   // 下 - 进步/社会
            -Math.PI/2 + 3*Math.PI/2 // 左 - 生态/环境
        ];
        
        const labels = ['平等', '自由', '进步', '生态'];
        const values = [econ, govt, scty, envo];
        const opposite_labels = ['市场', '权威', '传统', '生产'];
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制背景网格
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let level = 1; level <= 5; level++) {
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const r = radius * level / 5;
                const x = centerX + r * Math.cos(angles[i]);
                const y = centerY + r * Math.sin(angles[i]);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }
        
        // 绘制轴线
        ctx.strokeStyle = '#bdbdbd';
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + radius * Math.cos(angles[i]), centerY + radius * Math.sin(angles[i]));
            ctx.stroke();
        }
        
        // 绘制用户数据区域
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const r = radius * values[i] / 100;
            const x = centerX + r * Math.cos(angles[i]);
            const y = centerY + r * Math.sin(angles[i]);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 150, 136, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#009688';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制数据点
        ctx.fillStyle = '#009688';
        for (let i = 0; i < 4; i++) {
            const r = radius * values[i] / 100;
            const x = centerX + r * Math.cos(angles[i]);
            const y = centerY + r * Math.sin(angles[i]);
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // 绘制标签
        ctx.fillStyle = '#333';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < 4; i++) {
            const x = centerX + (radius + 25) * Math.cos(angles[i]);
            const y = centerY + (radius + 25) * Math.sin(angles[i]);
            ctx.fillText(labels[i], x, y - 8);
            ctx.fillStyle = '#9e9e9e';
            ctx.font = '12px sans-serif';
            ctx.fillText(opposite_labels[i], x, y + 8);
            ctx.fillStyle = '#333';
            ctx.font = '14px sans-serif';
        }
        
        // 绘制中心数值
        ctx.fillStyle = '#666';
        ctx.font = '12px sans-serif';
        ctx.fillText('100', centerX, centerY - radius + 2);
    }

    function initialize() {
        let equality = parseInt(get_value("econ")) || 50;
        let liberty = parseInt(get_value("govt")) || 50;
        let progress = parseInt(get_value("scty")) || 50;
        let ecology = parseInt(get_value("envo")) || 50;
        
        let user_scores = {
            econ: equality,
            govt: liberty,
            scty: progress,
            envo: ecology
        };

        set_bar_and_percent("equality", "market", equality)
        set_bar_and_percent("liberty", "authority", liberty)
        set_bar_and_percent("progress", "tradition", progress)
        set_bar_and_percent("ecology", "production", ecology)

        // 处理特殊维度
        let special_desc = ""
        specials.forEach((item) => {
            let value = parseInt(get_value(item.id))
            if (!isNaN(value)) {
                if (value >= 66) {
                    special_desc += "<strong>" + item.name + "</strong>：" + item.desc + "<br>"
                    $("#" + item.id + "-show").removeClass("hide")
                    if (value < 83) {
                        $("#" + item.id + "-show img").css({"opacity": "50%"})
                    }
                }
            }
        })
        $("#special-desc").html(special_desc)

        $("#label-econ").html(get_label(equality, econ_arr))
        $("#label-govt").html(get_label(liberty, govt_arr))
        $("#label-scty").html(get_label(progress, scty_arr))
        $("#label-envo").html(get_label(ecology, envo_arr))

        // 计算所有意识形态的匹配度
        let matches = [];
        for (let i = 0; i < ideologies.length; i++) {
            let dist = calculate_distance(user_scores, ideologies[i]);
            let similarity = distance_to_similarity(dist);
            matches.push({
                index: i,
                distance: dist,
                similarity: similarity,
                ideology: ideologies[i]
            });
        }
        
        // 按相似度排序（从高到低）
        matches.sort((a, b) => a.distance - b.distance);
        
        // 显示最匹配的意识形态
        if (!isNaN(equality) && !isNaN(liberty) && !isNaN(progress) && !isNaN(ecology)) {
            $("#ideology-label").html(matches[0].ideology.name)
            $("#ideology-label2").html(matches[0].ideology.name + "（匹配度 " + matches[0].similarity + "%）")
            $("#ideology-desc").html(matches[0].ideology.desc)
            $("#ideology-link").attr("href", matches[0].ideology.link).html(matches[0].ideology.link)
            
            // 显示前5个相近的意识形态
            let close_matches_html = "";
            for (let i = 1; i < Math.min(6, matches.length); i++) {
                let m = matches[i];
                let bar_color = m.similarity >= 70 ? "green" : m.similarity >= 50 ? "yellow darken-2" : "grey";
                close_matches_html += `
                    <div class="collection-item">
                        <div class="row valign-wrapper" style="margin-bottom: 0;">
                            <div class="col s5">
                                <strong>${m.ideology.name}</strong>
                            </div>
                            <div class="col s5">
                                <div class="progress ${bar_color} lighten-3" style="height: 8px; margin: 0;">
                                    <div class="determinate ${bar_color}" style="width: ${m.similarity}%"></div>
                                </div>
                            </div>
                            <div class="col s2 right-align">
                                <span class="grey-text text-darken-1">${m.similarity}%</span>
                            </div>
                        </div>
                    </div>
                `;
            }
            $("#close-matches-list").html(close_matches_html);
        }
        
        // 绘制雷达图
        setTimeout(() => {
            draw_radar_chart(equality, liberty, progress, ecology);
        }, 100);
    }

})
