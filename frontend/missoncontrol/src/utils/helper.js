export const validateEmail =(email)=>{
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return regex.test(email)
}
export const addThoudsandsSeparator =(num)=>{
    if(num == null || isNaN(num)) return ""

    const [integerPart,fractionalPart]= num.toString().split(".")
    const formattedinteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g,",")

    return fractionalPart
    ? `${formattedinteger}.${fractionalPart}`
    :formattedinteger
}