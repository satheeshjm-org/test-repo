

"""
USAGE:

cli = get_metrics_client()
cli.incr()
cli.decr()
cli.gauge()
cli.set()
cli.timer()
See https://github.com/jsocol/pystatsd/blob/master/docs/types.rst for a into on the standard statsd methods

NOTE:

Telegraf and Datadog have extended the statsd protocol to enable "per metric tags"
The more popular python statsd client lib, doesn't support tags since it is not part of the statsd protocol
(https://github.com/jsocol/pystatsd/blob/master/docs/tags.rst)
So we have to make do with a forked version statsd-telegraf for now.

This forked version doesn't seem to have pulled in latest changes from the original repo though.
TODO: fork the repo into a Freshworks' repository and extend the library to include tags (extending shouldn't be too hard)
"""


import newrelic.agent
import constants
import logging
from statsd import StatsClient
import time

is_telegraf_enabled = constants.TELEGRAF_ENABLED
telegraf_host = constants.TELEGRAF_HOST
telegraf_port = constants.TELEGRAF_PORT
statsd_client = None


def get_metrics_client():

    global statsd_client
    if statsd_client:
        return statsd_client

    try:
        statsd_client = FreddyStatsClient(
            host=telegraf_host,
            port=telegraf_port,
            prefix="freddy.mlserv"
        )
        return statsd_client
    except Exception as e:
        logging.error('StatsD initialization error', e)
        newrelic.agent.record_exception()




"""
a wrapper around the get_metrics_client which raises an error if there is no client
useful for identifying any issues during application startup 
"""
def init():
    global statsd_client
    statsd_client = get_metrics_client()
    if not statsd_client:
        raise ConnectionError





"""
Extending the base StatsDClient for 2 purposes
1. to stub out metrics reporting in case we have disabled Telegraf . Primarily useful for staging/local environments
2. to suppress exceptions.. we don't want any exceptions in statsd to propogate to the application
"""
class FreddyStatsClient(StatsClient):

    def suppress_exceptions(func):
        def wrapper(*args, **kwargs):
            try:
                #we don't want to execute the metrics functions if telegraf is disabled
                if not is_telegraf_enabled: return
                return func(*args, **kwargs)
            except Exception as e:
                logging.error("Error in a statsD function",e)
        return wrapper

    @suppress_exceptions
    def timer(self, stat, rate=1):
        return super().timer(stat, rate)

    @suppress_exceptions
    def timing(self, stat, delta, rate=1, tags=None):
        super().timing(stat, delta, rate, tags)

    @suppress_exceptions
    def incr(self, stat, count=1, rate=1, tags=None):
        super().incr(stat, count, rate, tags)

    @suppress_exceptions
    def decr(self, stat, count=1, rate=1, tags=None):
        super().decr(stat, count, rate, tags)

    @suppress_exceptions
    def gauge(self, stat, value, rate=1, delta=False, tags=None):
        super().gauge(stat, value, rate, delta, tags)

    @suppress_exceptions
    def set(self, stat, value, rate=1, tags=None):
        super().set(stat, value, rate, tags)


    def __init__(self, host='localhost', port=8125, prefix=None, maxudpsize=512, ipv6=False):
        if not is_telegraf_enabled: return
        super().__init__(host, port, prefix, maxudpsize, ipv6)



"""
For functions decorated with this decorator, the execution time will be reported
TODO: need to report cortex_id for these as well
"""
def gauge_execution_time(*args, **kwarg):
    metric_name = "perf_" + args[0]
    def decorator(func):
        if not is_telegraf_enabled: return func
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                return func(*args, **kwargs)
            finally:
                elapsed_time_ms = 1000.0 * (time.time() - start_time)
                metrics_client = get_metrics_client()
                metrics_client.timing(metric_name, elapsed_time_ms)
        return wrapper
    return decorator