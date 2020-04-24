import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="statsd-telegraf", # Replace with your own username
    version="0.0.1",
    author="Satheesh JM",
    author_email="satheesh.maheshkumar@freshworks.com",
    description="A telegraf client which reports time series data using statsd.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/freshdesk/system42-python-packages/tree/master/statsd-telegraf",
    packages=["statsd-telegraf"],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.6',
    install_requires = [
        'statsd-telegraf==3.2.1.post1'
    ]
)