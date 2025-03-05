const blacklist = new Set()

export const addToBlackList = async(token)=>{
    blacklist.add(token);
}

export const isTokenBlackListed = (token) =>{
    const isBlacklisted = blacklist.has(token);
    return isBlacklisted;
}