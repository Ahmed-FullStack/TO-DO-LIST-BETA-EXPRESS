exports.getFullDate = () => {
    return new Date().toLocaleDateString('en-US', {weekday: 'long'}) 
}