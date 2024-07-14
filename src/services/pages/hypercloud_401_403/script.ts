try {
    window.onload = () => {
        const container = document.getElementById('container');
        if (container) {
            const str = container.innerHTML.toString();

            let i = 0;
            container.innerHTML = ""

            setTimeout(function () {
                var se = setInterval(function () {
                    i++;
                    container.innerHTML = str.slice(0, i) + "|";
                    if (i == str.length) {
                        clearInterval(se);
                        container.innerHTML = str;
                    }
                }, 10);
            }, 0);
        }
    }
} catch (error) {
    console.error(error);
}