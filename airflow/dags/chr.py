# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # pylint: disable=no-name-in-module
from airflow.utils.dates import days_ago  # pylint: disable=no-name-in-module

import util

_CHR_WORKFLOW_ID = 'CHR_DATA'
_CHR_DATASET_NAME = 'chr_data'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'chr_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for CHR',
)

chr_bq_payload = util.generate_bq_payload(_CHR_WORKFLOW_ID, _CHR_DATASET_NAME, demographic='race')
chr_pop_bq_operator = util.create_bq_ingest_operator('chr_to_bq', chr_bq_payload, data_ingestion_dag)

chr_exporter_payload = {'dataset_name': _CHR_DATASET_NAME}
chr_exporter_operator = util.create_exporter_operator('chr_exporter', chr_exporter_payload, data_ingestion_dag)

# Ingestion DAG
(chr_pop_bq_operator >> chr_exporter_operator)
