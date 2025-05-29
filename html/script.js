let buttonParams = [];
let images = [];

const openMenu = (data = null) => {
    let html = "";
    
    // Show the container when opening menu
    $("#container").addClass('menu-open').show();
    
    data.forEach((item, index) => {
        if(!item.hidden) {
            let header = item.header;
            let message = item.txt || item.text;
            let isMenuHeader = item.isMenuHeader;
            let isDisabled = item.disabled;
            let icon = item.icon;
            
            images[index] = item;
            html += getButtonRender(header, message, index, isMenuHeader, isDisabled, icon);
            if (item.params) buttonParams[index] = item.params;
        }
    });
    
    $("#buttons").html(html);
    
    // Add staggered animation delay
    $('.button, .title').each(function(index) {
        $(this).css('animation-delay', `${index * 0.05}s`);
    });
    
    $('.button').click(function() {
        const target = $(this);
        if (!target.hasClass('title') && !target.hasClass('disabled')) {
            // Add click effect
            target.addClass('clicking');
            setTimeout(() => {
                postData(target.attr('id'));
            }, 150);
        }
    });
    
    // Add hover sound effect simulation
    $('.button').hover(
        function() {
            if (!$(this).hasClass('disabled')) {
                $(this).addClass('tech-hover');
            }
        },
        function() {
            $(this).removeClass('tech-hover');
        }
    );
};

const getButtonRender = (header, message = null, id, isMenuHeader, isDisabled, icon) => {
    // Enhanced icon handling for tech theme
    let iconHtml = '';
    
    if (icon) {
        if (icon.includes('http') || icon.includes('nui://')) {
            iconHtml = `<img src="${icon}" width="20" height="20" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                       <i class="fas fa-microchip" style="display:none;"></i>`;
        } else if (icon.includes('fa-') || icon.includes('fas ') || icon.includes('far ') || icon.includes('fab ')) {
            iconHtml = `<i class="${icon}"></i>`;
        } else {
            iconHtml = `<i class="fas fa-${icon}"></i>`;
        }
    } else {
        iconHtml = `<i class="fas fa-${isMenuHeader ? 'list' : 'chevron-right'}"></i>`;
    }
    
    return `
        <div class="${isMenuHeader ? "title" : "button"} ${isDisabled ? "disabled" : ""}" id="${id}">
            <div class="icon">
                ${iconHtml}
            </div>
            <div class="column">
                <div class="header">${header}</div>
                ${message ? `<div class="text">${message}</div>` : ""}
            </div>
            ${!isMenuHeader && !isDisabled ? '<div class="tech-arrow"><i class="fas fa-angle-right"></i></div>' : ''}
        </div>
    `;
};

const closeMenu = () => {
    // Add closing animation
    $('.button, .title').addClass('closing');
    
    setTimeout(() => {
        $("#buttons").html("");
        $('#imageHover').css('display', 'none');
        // Hide the container and remove the menu-open class
        $("#container").removeClass('menu-open').hide();
        buttonParams = [];
        images = [];
    }, 200);
};

const postData = (id) => {
    $.post(`https://${GetParentResourceName()}/clickedButton`, JSON.stringify(parseInt(id) + 1));
    return closeMenu();
};

const cancelMenu = () => {
    $.post(`https://${GetParentResourceName()}/closeMenu`);
    return closeMenu();
};

// Enhanced mouse movement with smoother image preview
let imageTimeout;
window.addEventListener('mousemove', (event) => {
    let $target = $(event.target);
    
    if ($target.closest('.button:hover').length && $('.button').is(":visible")) {
        let id = event.target.closest('.button').id;
        
        clearTimeout(imageTimeout);
        
        if (!images[id]) return;
        
        if (images[id].image) {
            imageTimeout = setTimeout(() => {
                $('#image').attr('src', images[id].image);
                $('#imageHover').css('display', 'block').hide().fadeIn(200);
            }, 100);
        }
    } else {
        clearTimeout(imageTimeout);
        $('#imageHover').fadeOut(150);
    }
});

window.addEventListener("message", (event) => {
    const data = event.data;
    const buttons = data.data;
    const action = data.action;
    
    switch (action) {
        case "OPEN_MENU":
        case "SHOW_HEADER":
            return openMenu(buttons);
        case "CLOSE_MENU":
            return closeMenu();
        default:
            return;
    }
});

document.onkeyup = function (event) {
    const charCode = event.key;
    if (charCode == "Escape") {
        cancelMenu();
    }
};

// Add some additional CSS for enhanced effects
const additionalStyles = `
<style>
.clicking {
    animation: click-pulse 0.3s ease-out;
}

@keyframes click-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(0.95); }
    100% { transform: scale(1); }
}

.tech-hover {
    animation: tech-glow 0.3s ease-out;
}

@keyframes tech-glow {
    0% { box-shadow: 0 0 5px var(--tech-glow); }
    100% { box-shadow: 0 0 20px var(--tech-glow-strong); }
}

.tech-arrow {
    color: var(--tech-primary);
    opacity: 0;
    transition: all 0.3s ease;
    font-size: 12px;
}

.button:hover .tech-arrow {
    opacity: 1;
    transform: translateX(4px);
}

.closing {
    animation: slide-out 0.2s ease-in forwards;
}

@keyframes slide-out {
    to {
        opacity: 0;
        transform: translateX(20px);
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalStyles);
