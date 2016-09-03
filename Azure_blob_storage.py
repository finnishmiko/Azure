from azure.storage.blob import BlockBlobService

block_blob_service = BlockBlobService(account_name='myaccount', account_key='mykey')

generator = block_blob_service.list_blobs('<container name>')
for blob in generator:
    print(blob.name)

#block_blob_service.get_blob_to_path('<container name>', blob.name, 'data1.csv')
