


const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds


const computeEndDate = (createdAt, duration) => {
    let endDate = new Date(createdAt);
    switch (duration) {
        case "1D":
            // Add one day to endDate
            endDate.setDate(endDate.getDate() + 1);
            break;
        case "2D":
            // Add two days to endDate
            endDate.setDate(endDate.getDate() + 2);
            break;
        case "1W":
            // Add one week to endDate
            endDate.setDate(endDate.getDate() + 7);
            break;
        default:
            console.error("Invalid duration ", duration);
            break;
    }
    return endDate;
}

const isPast = (createdAt, now, duration) => {
    const endDate = computeEndDate(createdAt, duration);
    return now > endDate;
}

const remainingDays = (createdAt, now, duration) => {
    const endDate = computeEndDate(createdAt, duration);

    return Math.round(Math.abs((now - endDate) / oneDay));

}

module.exports = {
    remainingDays,
    isPast
}