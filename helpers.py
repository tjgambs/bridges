
import csv
import requests


def geocode(address):
    try:
        url = 'https://maps.googleapis.com/maps/api/geocode/json?address=%s&key=%s'
        key = 'AIzaSyCSuWG7tXQtK7PawMXi9npl4JFbc-owZYU'
        response = requests.get(url % (address, key)).json()
        formatted_address = response['results'][0]['formatted_address']
        lat = response['results'][0]['geometry']['location']['lat']
        lng = response['results'][0]['geometry']['location']['lng']
        return (formatted_address, lat, lng)
    except Exception, e:
        return ('', '', '')

if __name__ == '__main__':
    rows_to_write = []
    cache = {}
    with open('data-geocoded.csv', 'w') as out:
        writer = csv.writer(out)
        with open('data.csv', 'rb') as csvfile:
            csvfile.next()
            reader = csv.reader(csvfile, delimiter=',')
            for row in reader:
                try:
                    address = '%s, Chicago, IL %s' % (row[3], row[4])
                    if not cache.get(address):
                        cache[address] = geocode(address)
                    formatted_address, lat, lng = cache[address]
                    writer.writerow(row + [formatted_address, lat, lng])
                    rows_to_write.append(row + [formatted_address, lat, lng])
                except Exception, e:
                    print e
