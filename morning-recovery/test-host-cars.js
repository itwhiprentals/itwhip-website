// First, let's get a car with host data
fetch('http://localhost:3000/api/rentals/cars/cmf9zat1t005rdocs69ygnqzv')
  .then(res => res.json())
  .then(car => {
    console.log('Car host data:', {
      hostId: car.hostId || car.host?.id,
      hostName: car.host?.name,
      hostPhoto: car.host?.profilePhoto
    })
    
    // Now test the host-cars endpoint
    const hostId = car.hostId || car.host?.id
    if (hostId) {
      return fetch(`http://localhost:3000/api/rentals/host-cars?hostId=${hostId}&exclude=${car.id}`)
    } else {
      console.log('No hostId found')
    }
  })
  .then(res => res?.json())
  .then(data => {
    if (data) {
      console.log('Host cars response:', {
        count: data.count,
        firstCar: data.cars?.[0],
        hostInfo: data.hostInfo
      })
    }
  })
  .catch(err => console.error('Error:', err))
