# Use a multi-architecture base image for Java 11 JRE
FROM eclipse-temurin:11-jre-focal

ARG FUSEKI_VERSION=4.10.0
ENV FUSEKI_HOME=/jena-fuseki
ENV PATH=$PATH:$FUSEKI_HOME/bin

# Install necessary tools (wget for download)
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# Download and extract Fuseki
RUN wget https://archive.apache.org/dist/jena/binaries/apache-jena-fuseki-$FUSEKI_VERSION.tar.gz -O /tmp/apache-jena-fuseki.tar.gz \
    && tar -xzf /tmp/apache-jena-fuseki.tar.gz -C / \
    && mv /apache-jena-fuseki-$FUSEKI_VERSION $FUSEKI_HOME \
    && rm /tmp/apache-jena-fuseki.tar.gz

WORKDIR $FUSEKI_HOME

# Expose the default Fuseki port
EXPOSE 3030

# Command to start Fuseki server
# This will start Fuseki. You might need to manually create the 'habitus33' dataset
# via the Fuseki UI after it starts, as this basic Dockerfile doesn't
# automatically handle the FUSEKI_DATASET environment variable like some pre-built images do.
CMD ["/jena-fuseki/fuseki-server"]