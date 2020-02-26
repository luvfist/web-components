const say = _ => {
    return "hurz";
};

const loadData = async _ => {
    const response = await fetch("data.json");
    const payload = await response.json();

    const fetchEvent = new CustomEvent('fetchEvent', {
        detail: payload,
        bubbles: true
    });

    window.dispatchEvent(fetchEvent);
};

export {say, loadData}