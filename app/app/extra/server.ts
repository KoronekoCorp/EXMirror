"use server"


export interface IP {
    "status": "success",
    "continent": string
    "continentCode": string
    "country": string
    "countryCode": string
    "region": string
    "regionName": string
    "city": string
    "district": string
    "zip": string
    "lat": number
    "lon": number
    "timezone": string
    "offset": number,
    "currency": string
    "isp": string
    "org": string
    "as": string
    "asname": string
    "reverse": string
    "mobile": boolean
    "proxy": boolean
    "hosting": boolean
    "query": string
    [key: string]: string | number | boolean
}

export async function Get_ip() {
    return (await fetch("http://ip-api.com/json/?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query")).json() as Promise<IP>
}
