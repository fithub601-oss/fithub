Resolve-DnsName '_mongodb._tcp.cluster0.t2vy0ki.mongodb.net' -Type SRV -DnsOnly | Select-Object NameTarget,Port | ConvertTo-Json
