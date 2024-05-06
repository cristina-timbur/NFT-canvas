const hexToColor = (hex) => {
    var value = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return value ? {
      red: parseInt(value[1], 16),
      green: parseInt(value[2], 16),
      blue: parseInt(value[3], 16)
    } : undefined;
}

module.exports = { hexToColor }